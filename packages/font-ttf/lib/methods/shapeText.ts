import { assert } from "@gpu-charts/core";
import { Vec2 } from "../math/Vec2.ts";
import { ATLAS_FONT_SIZE, ATLAS_GAP } from "./renderFontAtlas.ts";

export const ENABLE_KERNING = true;

export function getTextShape(lookups: Lookups, text: string, fontSize: number): Shape {
  const positions: Vec2[] = [];
  const sizes: Vec2[] = [];

  let positionX = 0;
  const scale = (1 / lookups.unitsPerEm) * fontSize;
  const padding = (ATLAS_GAP * fontSize) / ATLAS_FONT_SIZE;

  for (let i = 0; i < text.length; i++) {
    const character = text[i].charCodeAt(0);
    const glyph = lookups.glyphs.get(character);
    assert(glyph, `\nGlyph not found for character ${text[i]}\n  character position: ${i}\n  text: "${text}"`);

    const { y, width, height, lsb, rsb } = glyph;

    let kerning = 0;
    if (ENABLE_KERNING && text[i - 1] && text[i]) {
      kerning = lookups.kern(text[i - 1].charCodeAt(0), text[i].charCodeAt(0));
    }

    positions.push(
      new Vec2(positionX + (lsb + kerning) * scale - padding, (lookups.capHeight - y - height) * scale - padding),
    );

    // 2 * padding is to account for padding from both sides of the glyph.
    sizes.push(new Vec2(width * scale + padding * 2, height * scale + padding * 2));
    positionX += (lsb + kerning + width + rsb) * scale;
  }

  const width = (positions[positions.length - 1]?.x ?? 0) + sizes[sizes.length - 1].x;
  const height = (lookups.capHeight * fontSize) / lookups.unitsPerEm;

  return {
    positions,
    sizes,
    // Round up avoid layout gaps.
    boundingRectangle: {
      width: Math.ceil(width),
      height: Math.ceil(height),
    },
  };
}
