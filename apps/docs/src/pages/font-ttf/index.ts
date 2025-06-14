import { initFont, Vec2, Vec4 } from "@gpu-charts/font-ttf";
import {
  getCanvasById,
  setupCanvas,
  setupDevice,
  setOptimalResizeObserver,
} from "@gpu-charts/core";

const canvas = getCanvasById("canvas");
const { device, context, format } = await setupDevice(canvas);

setupCanvas(canvas);

context.configure({
  device,
  format,
  alphaMode: "premultiplied",
});

// const clearColorValue = { r: 255 / 255, g: 255 / 255, b: 255 / 255, a: 1 };
const clearColorValue = { r: 2 / 255, g: 61 / 255, b: 183 / 255, a: 1 };
// const fontColorValue = { r: 0, g: 0, b: 0, a: 1 };
const fontColorValue = { r: 1, g: 1, b: 1, a: 1 };

const fontRegular = await initFont(
  {
    fontSource: "./JetBrainsMono-Regular.ttf",
    device,
    context,
    canvas,
  },
  {
    debug: true,
    clearValue: clearColorValue,
    fontColorValue: fontColorValue,
  }
);

const fontThin = await initFont(
  {
    fontSource: "./JetBrainsMono-Thin.ttf",
    device,
    context,
    canvas,
  },
  {
    debug: true,
    clearValue: clearColorValue,
    fontColorValue: fontColorValue,
  }
);

const fontMedium = await initFont(
  {
    fontSource: "./JetBrainsMono-Medium.ttf",
    device,
    context,
    canvas,
  },
  {
    debug: true,
    clearValue: clearColorValue,
    fontColorValue: fontColorValue,
  }
);

const setupEncoder = (
  device: GPUDevice,
  context: GPUCanvasContext,
  view: GPUTextureView
) => {
  const commandEncoder = device.createCommandEncoder();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: view,
        resolveTarget: context.getCurrentTexture().createView(),
        clearValue: clearColorValue,
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });

  return { commandEncoder, renderPass };
};

setOptimalResizeObserver(canvas, device, () => {
  fontMedium.resize(canvas.width, canvas.height);
  fontRegular.resize(canvas.width, canvas.height);
  fontThin.resize(canvas.width, canvas.height);

  const { commandEncoder, renderPass } = setupEncoder(
    device,
    context,
    fontRegular.colorTextureView
  );

  fontMedium.text("1.000.000", new Vec2(16, 16 * 3), 12, new Vec4(fontColorValue.r, fontColorValue.g, fontColorValue.b, fontColorValue.a));
  fontThin.text("1.000.000", new Vec2(16, 16 * 2), 12, new Vec4(fontColorValue.r, fontColorValue.g, fontColorValue.b, fontColorValue.a));
  fontRegular.text("1.234.567,89", new Vec2(16, 16), 16, new Vec4(fontColorValue.r, fontColorValue.g, fontColorValue.b, fontColorValue.a));

  fontMedium.render(renderPass);
  fontRegular.render(renderPass);
  fontThin.render(renderPass);

  renderPass.end();
  device.queue.submit([commandEncoder.finish()]);
});
