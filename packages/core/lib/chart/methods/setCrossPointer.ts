interface SetCrossPointerContext {
  device: GPUDevice;
  format: string;
  context: GPUCanvasContext;
}

export function setCrossPointer({ device, format, context }: SetCrossPointerContext, commands: GpuRenderCommand[]) {
  console.log("ctx", device, format, context);

  commands.push({type: "draw", vertexCount: 3, instanceCount: 1});
}
