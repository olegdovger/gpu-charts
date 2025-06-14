import { assert } from "./assert.ts";

export const setupCanvas = (canvas: HTMLCanvasElement) => {
  // make canvas parent element with width of 100% and height of 100% and overflow hidden
  const parentElement = canvas.parentElement;

  assert(parentElement, "Canvas parent element not found");

  const newParentElement = document.createElement("div");

  newParentElement.style.width = "100%";
  newParentElement.style.height = "100%";
  newParentElement.style.overflow = "hidden";

  newParentElement.appendChild(canvas);

  parentElement.appendChild(newParentElement);
};
