import { assert } from "@gpu-charts/core";
import { FontRenderer } from "./FontRenderer.ts";

export interface LoadFontProps {
  fontSource: string;
  device: GPUDevice;
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
}

export interface LoadFontSettings {
  debug: boolean;
  clearValue: GPUColorDict;
  fontColorValue: GPUColorDict;
}

export async function initFont(
  props: LoadFontProps,
  settings: LoadFontSettings
): Promise<FontRenderer> {
  const { fontSource, device, canvas, context } = props;
  const { debug } = settings;

  assert(fontSource, "'fontSource' must be set.");

  const fontRenderer = new FontRenderer({
    canvas,
    device,
    context,

    clearValue: settings.clearValue,

    fontSource,
    fontColorValue: settings.fontColorValue,

    debug,
  });

  await fontRenderer.loadFont();

  return fontRenderer;
}
