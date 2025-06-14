interface RenderContext {
  device: GPUDevice;
  format: GPUTextureFormat;
  context: GPUCanvasContext;
}

export function render({ device, format, context }: RenderContext, commands: GpuRenderCommand[]) {
  const canvasTexture = context.getCurrentTexture();
  const canvasWidth = canvasTexture.width;
  const canvasHeight = canvasTexture.height;

  const commandEncoder = device.createCommandEncoder();

  const multisampledTexture = device.createTexture({
    size: [canvasWidth, canvasHeight],
    format: format,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    sampleCount: 4,
  });
  const depthTexture = device.createTexture({
    size: [canvasWidth, canvasHeight],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    sampleCount: 4,
  });

  if (multisampledTexture) multisampledTexture.destroy();
  if (depthTexture) depthTexture.destroy();

  const multisampledTextureView = multisampledTexture.createView();
  const depthTextureView = depthTexture.createView();

  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        loadOp: "clear",
        storeOp: "store",
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
        view: multisampledTextureView,
        resolveTarget: canvasTexture.createView(),
      },
    ],
    depthStencilAttachment: {
      view: depthTextureView,
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  });

  // for (const cmd of commands) {
  //   switch (cmd.type) {
  //     case 'setPipeline':
  //       renderPass.setPipeline(cmd.pipeline);
  //       break;
  //     case 'setBindGroup':
  //       renderPass.setBindGroup(cmd.index, cmd.bindGroup);
  //       break;
  //     case 'draw':
  //       renderPass.draw(cmd.vertexCount, cmd.instanceCount ?? 1);
  //       break;
  //   }
  // }

  console.log(commands);

  device.queue.submit([commandEncoder.finish()]);
}
