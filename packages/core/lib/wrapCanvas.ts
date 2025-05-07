import { assert } from './assert.ts';

export default function wrapCanvas(canvas: HTMLCanvasElement): void {
  const parentElement = canvas.parentElement;

  assert(parentElement, 'Canvas parent element not found');

  const newParentElement = document.createElement('div');

  newParentElement.style.width = '100%';
  newParentElement.style.height = '100%';
  newParentElement.style.overflow = 'hidden';

  newParentElement.appendChild(canvas);

  parentElement.appendChild(newParentElement);
}
