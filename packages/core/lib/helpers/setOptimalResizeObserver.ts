import { assert } from "./assert.ts";

export function setOptimalResizeObserver(canvas: HTMLCanvasElement, device: GPUDevice, render?: () => void) {
  const parentElement = canvas.parentElement;

  if (!parentElement) {
    throw new Error("No parent element found");
  }

  let timeout = -1;

  const observer = new ResizeObserver((entries) => {
    const pixelBoxSize = entries[0].devicePixelContentBoxSize?.[0];

    assert(pixelBoxSize, "pixelBoxSize is not defined");

    for (const entry of entries) {
      const { inlineSize, blockSize } = entry.contentBoxSize[0];

      const width = pixelBoxSize.inlineSize || inlineSize * devicePixelRatio;
      const height = pixelBoxSize.blockSize || blockSize * devicePixelRatio;

      // const canvas = entry.target as HTMLCanvasElement;
      const maxTextureDimension2D = device.limits.maxTextureDimension2D;

      if (timeout !== -1) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        canvas.width = Math.max(1, Math.min(width, maxTextureDimension2D));
        canvas.height = Math.max(1, Math.min(height, maxTextureDimension2D));

        canvas.style.width = `${canvas.width / devicePixelRatio}px`;
        canvas.style.height = `${canvas.height / devicePixelRatio}px`;

        render?.();
      }, 500);
    }
  });

  try {
    observer.observe(parentElement, { box: "device-pixel-content-box" });
  } catch {
    observer.observe(parentElement, { box: "content-box" });
  }
}
