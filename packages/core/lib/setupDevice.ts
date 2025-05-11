import { getAdapter } from './getAdapter.ts';
import { getCanvasContext } from './getCanvasContext.ts';

export async function setupDevice(
  canvas: HTMLCanvasElement
): Promise<DeviceSetup> {
  const context = getCanvasContext(canvas);

  const adapter = await getAdapter();

  const device = await adapter.requestDevice();

  const format = navigator.gpu.getPreferredCanvasFormat();

  return { device, format, context };
}
