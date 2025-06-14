import { getCanvasById } from "../helpers/getCanvasById.ts";
import { setupDevice } from "../helpers/setupDevice.ts";
import { configureContext } from "./methods/configureContext.ts";
import { render } from "./methods/render.ts";
import { setCrossPointer } from "./methods/setCrossPointer.ts";

export async function initChart(canvasId: string): Promise<ChartAPI> {
  const canvas = getCanvasById(canvasId);

  const { device, format, context } = await setupDevice(canvas);

  configureContext({ device, format, context });

  const commands: GpuRenderCommand[] = [];

  return {
    render: () => render({ device, format, context }, commands),
    setViewConfig: (_: ViewConfig) => notImplemented("setViewConfig"),
    setChartConfig: (_: ChartConfig) => notImplemented("setChartConfig"),
    destroy: () => notImplemented("destroy"),

    setCrossPointer: () => setCrossPointer({ device, format, context }, commands),

    onResize: (_: VoidFunction) => notImplemented("onResize"),
    offResize: () => notImplemented("offResize"),
    onDestroy: (_: VoidFunction) => notImplemented("onDestroy"),
    offDestroy: () => notImplemented("offDestroy"),

    onZoomIn: (_: (zoom: number) => void) => notImplemented("onZoomIn"),
    offZoomIn: () => notImplemented("offZoomIn"),
    onZoomOut: (_: (zoom: number) => void) => notImplemented("onZoomOut"),
    offZoomOut: () => notImplemented("offZoomOut"),

    onMouseMove: (_: (x: number, y: number) => void) => notImplemented("onMouseMove"),
    offMouseMove: () => notImplemented("offMouseMove"),
    onMouseDown: (_: (x: number, y: number) => void) => notImplemented("onMouseDown"),
    offMouseDown: () => notImplemented("offMouseDown"),
    onMouseUp: (_: (x: number, y: number) => void) => notImplemented("onMouseUp"),
    offMouseUp: () => notImplemented("offMouseUp"),
    onMouseEnter: (_: (x: number, y: number) => void) => notImplemented("onMouseEnter"),
    offMouseEnter: () => notImplemented("offMouseEnter"),
    onMouseLeave: (_: (x: number, y: number) => void) => notImplemented("onMouseLeave"),
    offMouseLeave: () => notImplemented("offMouseLeave"),

    onWheel: (_: (delta: number) => void) => notImplemented("onWheel"),
    offWheel: () => notImplemented("offWheel"),
    onKeyUp: (_: VoidFunction) => notImplemented("onKeyUp"),
    offKeyUp: () => notImplemented("offKeyUp"),
    onKeyDown: (_: VoidFunction) => notImplemented("onKeyDown"),
    offKeyDown: () => notImplemented("offKeyDown"),

    onTouchStart: (_: (x: number, y: number) => void) => notImplemented("onTouchStart"),
    offTouchStart: () => notImplemented("offTouchStart"),
    onTouchMove: (_: (x: number, y: number) => void) => notImplemented("onTouchMove"),
    offTouchMove: () => notImplemented("offTouchMove"),
    onTouchEnd: (_: (x: number, y: number) => void) => notImplemented("onTouchEnd"),
    offTouchEnd: () => notImplemented("offTouchEnd"),
  };
}

export function notImplemented(method: string): never {
  throw new Error(`Method ${method} not implemented`);
}
