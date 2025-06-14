export function configureContext({ device, format, context }: { device: GPUDevice, format: GPUTextureFormat, context: GPUCanvasContext }) {
  context.configure({
    device,
    format,
    alphaMode: "premultiplied",
  });
}