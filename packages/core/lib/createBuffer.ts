export const createBuffer = (
  device: GPUDevice,
  size: number,
  usage: GPUBufferUsageFlags
) => {
  const buffer = device.createBuffer({
    size,
    usage,
  });

  return buffer;
};
