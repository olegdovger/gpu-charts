import { assert } from "@gpu-charts/core";
import { toSDF } from "./toSDF.ts";

/**
 * Font size used in font atlas.
 */
export const ATLAS_FONT_SIZE = 48;
/**
 * Buffer space left around each glyph.
 */
export const ATLAS_GAP = 4; // Half of the radius.
/**
 * Radius of the SDF. Sometimes called `spread`.
 */
const ATLAS_RADIUS = 8; // Roughly 1/6 of font size.

const DEBUG_FONT_ATLAS_SHOW_GLYPH_BACKGROUNDS = false;

export async function renderFontAtlas(
  lookups: Lookups,
  buffer: ArrayBuffer,
  options?: {
    alphabet?: string;
    useSDF?: boolean;
  },
): Promise<ImageBitmap> {
  const canvas = document.createElement("canvas");
  canvas.width = lookups.atlas.width;
  canvas.height = lookups.atlas.height;

  const context = canvas.getContext("2d");
  assert(context, "Could not get 2D context.");

  const scale = (1 / lookups.unitsPerEm) * ATLAS_FONT_SIZE;

  const fontName = "FontForAtlas";
  const fontFace = new FontFace(fontName, buffer);
  await fontFace.load();
  document.fonts.add(fontFace);

  context.font = `${ATLAS_FONT_SIZE}px ${fontName}`;

  const glyphs = [...lookups.glyphs.values()];
  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i];
    const position = lookups.atlas.positions[i];
    const size = lookups.atlas.sizes[i];

    if (DEBUG_FONT_ATLAS_SHOW_GLYPH_BACKGROUNDS) {
      context.fillStyle = "rgba(255, 0, 255, 0.3)";
      context.fillRect(position.x, position.y, size.x, size.y);
    }

    context.fillStyle = "rgba(255, 255, 255, 1)";
    context.fillText(
      String.fromCharCode(glyph.id),
      // Additionally offset by glyph (X, Y).
      position.x - glyph.x * scale + ATLAS_GAP,
      position.y + size.y + glyph.y * scale - ATLAS_GAP,
    );
  }

  if (options?.useSDF) {
    // Apply SDF.
    const imageData = context.getImageData(0, 0, lookups.atlas.width, lookups.atlas.height);
    const sdfData = toSDF(imageData, lookups.atlas.width, lookups.atlas.height, ATLAS_RADIUS);
    context.putImageData(sdfData, 0, 0);
  }

  return await createImageBitmap(canvas);
}
