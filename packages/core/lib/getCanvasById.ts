import { tryGet } from "./tryGet.ts";

export function getCanvasById(id: string): HTMLCanvasElement {
  const element = tryGet(
    document.getElementById(id) as HTMLCanvasElement,
    `Element with id ${id} not found`,
  );

  return element;
}