/// <reference types="@webgpu/types" />

interface DeviceSetup {
  device: GPUDevice;
  format: GPUTextureFormat;
  context: GPUCanvasContext;
}

/**
 * Padding in pixels.
 */
interface Padding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

/**
 * Padding as a percentage of the chart size.
 */
interface PaddingPercent {
  topPercent?: number;
  rightPercent?: number;
  bottomPercent?: number;
  leftPercent?: number;
}

interface TextConfig {
  /**
   * Text size.
   */
  size?: number;
  /**
   * Text weight.
   */
  weight?: number;

  /**
   * Text color. */
  color?: string;
  /**
   * Text alignment.
   */
  textAlign?: "left" | "center" | "right";
  /**
   * Text offset.
   */
  offset?: {
    x?: number;
    y?: number;
  };
}

interface ViewConfig {

}

interface ChartConfig {
  /**
   * Chart background color.
   */
  backgroundColor?: string;

  /**
   * Padding in pixels or as a percentage of the canvas size.
   */
  padding: Padding | PaddingPercent | undefined;
}

interface ChartAPI {
  setViewConfig: (config: ViewConfig) => void;
  setChartConfig: (config: ChartConfig) => void;
  render: () => void;
  destroy: () => void;

  /**
   * Set cross pointer which go .
   */
  setCrossPointer: () => void;

  //events
  onResize: (callback: VoidFunction) => void;
  offResize: VoidFunction;
  onDestroy: (callback: VoidFunction) => void;
  offDestroy: VoidFunction;

  onZoomIn: (callback: (zoom: number) => void) => void;
  offZoomIn: VoidFunction;
  onZoomOut: (callback: (zoom: number) => void) => void;
  offZoomOut: VoidFunction;

  onMouseMove: (callback: (x: number, y: number) => void) => void;
  offMouseMove: VoidFunction;
  onMouseDown: (callback: (x: number, y: number) => void) => void;
  offMouseDown: VoidFunction;
  onMouseUp: (callback: (x: number, y: number) => void) => void;
  offMouseUp: VoidFunction;
  onMouseEnter: (callback: (x: number, y: number) => void) => void;
  offMouseEnter: VoidFunction;
  onMouseLeave: (callback: (x: number, y: number) => void) => void;
  offMouseLeave: VoidFunction;

  onWheel: (callback: (delta: number) => void) => void;
  offWheel: VoidFunction;
  onKeyUp: (callback: VoidFunction) => void;
  offKeyUp: VoidFunction;
  onKeyDown: (callback: VoidFunction) => void;
  offKeyDown: VoidFunction;

  onTouchStart: (callback: (x: number, y: number) => void) => void;
  offTouchStart: VoidFunction;
  onTouchMove: (callback: (x: number, y: number) => void) => void;
  offTouchMove: VoidFunction;
  onTouchEnd: (callback: (x: number, y: number) => void) => void;
  offTouchEnd: VoidFunction;
}

interface ChartEvents {
  onResize: () => void;
}

type GpuRenderCommand =
  | { type: "setPipeline"; pipeline: GPURenderPipeline }
  | { type: "setBindGroup"; index: number; bindGroup: GPUBindGroup }
  | { type: "draw"; vertexCount: number; instanceCount?: number };
