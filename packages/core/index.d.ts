/// <reference types="@webgpu/types" />

interface DeviceSetup {
  device: GPUDevice;
  format: GPUTextureFormat;
  context: GPUCanvasContext;
}
