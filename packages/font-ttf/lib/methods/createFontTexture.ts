async function createFontTexture(device: GPUDevice, imageBitmap: ImageBitmap) {
  const size = { width: imageBitmap.width, height: imageBitmap.height };

  const texture = device.createTexture({
    label: "image bitmap",
    size,
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture }, size);

  return texture;
}

export default createFontTexture;
