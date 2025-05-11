import { tryGet } from "./tryGet.ts";

export function getCanvasContext(canvas: HTMLCanvasElement): GPUCanvasContext {
  return tryGet(canvas.getContext("webgpu"), "Context is empty for some reason");
}