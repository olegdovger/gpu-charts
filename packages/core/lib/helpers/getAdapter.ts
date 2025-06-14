import { tryGet } from "./tryGet.ts";

export async function getAdapter(): Promise<GPUAdapter> {
  return tryGet(
    await navigator.gpu.requestAdapter(),
    "Adapter is not available"
  );
}
