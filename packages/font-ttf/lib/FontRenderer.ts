import { assert } from "@gpu-charts/core";
import { Vec2 } from "./math/Vec2.ts";
import { Vec4 } from "./math/Vec4.ts";
import { getTextShape } from "./methods/shapeText.ts";
import { parseTTF } from "./methods/parseTTF.ts";
import { renderFontAtlas } from "./methods/renderFontAtlas.ts";
import { prepareLookups } from "./methods/prepareLookups.ts";
import createFontTexture from "./methods/createFontTexture.ts";

const TEXT_BUFFER_SIZE = 16 * 1000;

const SAMPLE_COUNT = 4;

interface FontRendererProps {
  device: GPUDevice;
  context: GPUCanvasContext;
  canvas: HTMLCanvasElement;
  clearValue: GPUColorDict;
  fontColorValue: GPUColorDict;
  fontSource: string;
  debug?: boolean;
}

interface TextShape {
  bounds: Shape["boundingRectangle"];
  position: Vec2;
  fontSize: number;
}

export class FontRenderer {
  glyphData: Float32Array = new Float32Array(TEXT_BUFFER_SIZE);
  glyphCount: number = 0;

  vertexBuffer: GPUBuffer;
  textBuffer: GPUBuffer;
  textBindGroupLayout: GPUBindGroupLayout;
  textBindGroup: GPUBindGroup | null = null;
  textPipeline: GPURenderPipeline;

  sampler: GPUSampler;
  fontLookups: Lookups | null = null;

  fontSource: string;

  device: GPUDevice;
  context: GPUCanvasContext;
  colorTextureView: GPUTextureView;
  clearValue: GPUColorDict;
  fontColorValue: GPUColorDict;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;

  loadedFontFile: ArrayBuffer | null = null;
  parsedTTF: TTFSource | null = null;
  fontAtlas: ImageBitmap | null = null;
  preparedLookups: Lookups | null = null;

  debug: boolean;

  constructor(props: FontRendererProps) {
    const {
      device,
      context,
      canvas,
      clearValue,
      fontColorValue,
      fontSource,
      debug = false,
    } = props;

    this.debug = debug;

    this.fontSource = fontSource;
    this.device = device;
    this.context = context;
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.clearValue = clearValue;
    this.fontColorValue = fontColorValue;

    this.colorTextureView = this.#createColorTexture();

    const devicePixelRatio = window.devicePixelRatio;

    const textModule = device.createShaderModule({
      code: /* wgsl*/ `
      struct VertexInput {
        @location(0) position: vec2f,
        @builtin(instance_index) instance: u32
      };
      
      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(1) @interpolate(flat) instance: u32,
        @location(2) @interpolate(linear) vertex: vec2f,
        @location(3) @interpolate(linear) uv: vec2f,
      };
      
      struct Glyph {
        position: vec2f,
        _positionY: f32,
        fontSize: f32,
        color: vec4f,
        size: vec2f,
        uv: vec2f,
        uvSize: vec2f,
        window: vec2f,
      };
      
      struct GlyphData {
        glyphs: array<Glyph>,
      };
      
      @group(0) @binding(0) var<storage> text: GlyphData;
      @group(0) @binding(1) var fontAtlasSampler: sampler;
      @group(0) @binding(2) var fontAtlas: texture_2d<f32>;
      
      @vertex
      fn vertexMain(input: VertexInput) -> VertexOutput {
          var output: VertexOutput;
          let g = text.glyphs[input.instance];
          let vertex = mix(g.position.xy, g.position.xy + g.size, input.position);
      
          output.position = vec4f(((vertex / g.window) / .5), 0, 1);
          output.position.x = output.position.x - 1.0;
          output.position.y = -(output.position.y + 1.0 - (g.fontSize / g.window.y) / .5) + (g._positionY / .5 / g.window.y) / .5;
      
          output.instance = input.instance;
          output.vertex.x = vertex.x;
          output.vertex.y = vertex.y;
          output.uv = mix(g.uv, g.uv + g.uvSize, input.position);
      
          return output;
      }
      
      override devicePixelRatio: f32 = ${devicePixelRatio};
      
      @fragment
      fn fragmentMain(output: VertexOutput) -> @location(0) vec4f {
          let g = text.glyphs[output.instance];
          let distance = textureSample(fontAtlas, fontAtlasSampler, output.uv).a;
      
          var width = mix(0.4, 0.1, clamp(g.fontSize, 0, 40) / 40.0);
          width /= devicePixelRatio;
      
          let alpha = g.color.a * smoothstep(0.5 - width, 0.5 + width, distance);
      
          return vec4f(g.color.rgb, alpha);
      }
      
      `,
    });

    this.vertexBuffer = device.createBuffer({
      label: "vertex",
      // Just two triangles.
      size: 2 * 2 * 3 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.textBuffer = device.createBuffer({
      label: "text",
      size: TEXT_BUFFER_SIZE * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    this.textBindGroupLayout = device.createBindGroupLayout({
      label: "text bind group layout",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: "read-only-storage" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {},
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {},
        },
      ],
    });

    const textPipelineLayout = device.createPipelineLayout({
      label: "text pipeline layout",
      bindGroupLayouts: [this.textBindGroupLayout],
    });

    this.sampler = device.createSampler({
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
      magFilter: "linear",
      minFilter: "linear",
      mipmapFilter: "linear",
    });

    this.textPipeline = device.createRenderPipeline({
      label: "text",
      layout: textPipelineLayout,
      vertex: {
        module: textModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: "float32x2",
              },
            ],
          },
        ],
      },
      fragment: {
        module: textModule,
        entryPoint: "fragmentMain",
        targets: [
          {
            format: navigator.gpu.getPreferredCanvasFormat(),
            blend: {
              color: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
              },
              alpha: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
              },
            },
          },
        ],
        constants: {
          devicePixelRatio: window.devicePixelRatio,
        },
      },
      multisample: { count: SAMPLE_COUNT },
    });

    // Just regular full-screen quad consisting of two triangles.
    const vertices = [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1];

    device.queue.writeBuffer(this.vertexBuffer, 0, new Float32Array(vertices));
  }

  #createColorTexture() {
    const colorTexture = this.device.createTexture({
      label: "colorTexture",
      size: { width: this.width, height: this.height },
      sampleCount: SAMPLE_COUNT,
      format: "bgra8unorm",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });

    return colorTexture.createView({ label: "color" });
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.colorTextureView = this.#createColorTexture();
  }

  async loadFont(): Promise<void> {
    this.loadedFontFile = await fetch(this.fontSource).then((result) =>
      result.arrayBuffer()
    );

    assert(this.loadedFontFile, "Font file not loaded");

    this.parsedTTF = parseTTF(this.loadedFontFile, { debug: this.debug });
    this.preparedLookups = prepareLookups(this.parsedTTF);

    this.fontAtlas = await renderFontAtlas(
      this.preparedLookups,
      this.loadedFontFile,
      { useSDF: true }
    );

    const fontAtlasTexture = await createFontTexture(
      this.device,
      this.fontAtlas
    );

    this.#setFont(this.preparedLookups, fontAtlasTexture);
  }

  #setFont(lookups: Lookups, fontAtlasTexture: GPUTexture): void {
    this.fontLookups = lookups;
    this.textBindGroup = this.device.createBindGroup({
      label: "text",
      layout: this.textBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.textBuffer },
        },
        {
          binding: 1,
          resource: this.sampler,
        },
        {
          binding: 2,
          resource: fontAtlasTexture.createView(),
        },
      ],
    });
  }

  text(
    text: string,
    position: Vec2,
    fontSize: number,
    color?: Vec4
  ): TextShape {
    assert(this.fontLookups, "Font must be set.");
    const shape = getTextShape(this.fontLookups, text, fontSize);

    for (let i = 0; i < shape.positions.length; i++) {
      const shapePosition = shape.positions[i].add(position);
      const size = shape.sizes[i];

      const uv = this.fontLookups.uvs.get(text[i].charCodeAt(0));
      assert(uv, "UV does not exist.");

      const colorRed = color?.x ?? this.fontColorValue?.r;
      const colorGreen = color?.y ?? this.fontColorValue?.g;
      const colorBlue = color?.z ?? this.fontColorValue?.b;
      const colorOpacity = color?.w ?? this.fontColorValue?.a;

      const struct = 16;
      const startPosition = this.glyphCount * struct;

      // text char position
      this.glyphData[startPosition] = shapePosition.x;
      this.glyphData[startPosition + 1] = shapePosition.y;
      this.glyphData[startPosition + 2] = position.y;
      this.glyphData[startPosition + 3] = fontSize;

      // text char color
      this.glyphData[startPosition + 4] = colorRed;
      this.glyphData[startPosition + 5] = colorGreen;
      this.glyphData[startPosition + 6] = colorBlue;
      this.glyphData[startPosition + 7] = colorOpacity;

      const pixelRatioWidth = this.width / window.devicePixelRatio;
      const pixelRatioHeight = this.height / window.devicePixelRatio;
      // text char size
      this.glyphData[startPosition + 8] = size.x;
      this.glyphData[startPosition + 9] = size.y;
      this.glyphData[startPosition + 10] = uv.x;
      this.glyphData[startPosition + 11] = uv.y;
      this.glyphData[startPosition + 12] = uv.z;
      this.glyphData[startPosition + 13] = uv.w;
      this.glyphData[startPosition + 14] = pixelRatioWidth;
      this.glyphData[startPosition + 15] = pixelRatioHeight;

      this.glyphCount += 1;
    }

    return {
      bounds: shape.boundingRectangle,
      position,
      fontSize,
    };
  }

  render(renderPass?: GPURenderPassEncoder): void {
    assert(this.context, "Context does not exist.");

    const commandEncoder = this.device.createCommandEncoder();
    const pass =
      renderPass ||
      commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: this.colorTextureView,
            resolveTarget: this.context
              .getCurrentTexture()
              .createView({ label: "antialiased resolve target" }),
            clearValue: this.clearValue,
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });

    if (this.glyphCount > 0) {
      this.device.queue.writeBuffer(this.textBuffer, 0, this.glyphData);

      pass.setViewport(0, 0, this.width, this.height, 0, 1);
      pass.setVertexBuffer(0, this.vertexBuffer);

      pass.setPipeline(this.textPipeline);
      pass.setBindGroup(0, this.textBindGroup);
      pass.draw(6, this.glyphCount);
    }

    if (!renderPass) {
      pass.end();
      this.device.queue.submit([commandEncoder.finish()]);
    }

    this.glyphCount = 0;
    this.glyphData = new Float32Array(TEXT_BUFFER_SIZE);
  }
}
