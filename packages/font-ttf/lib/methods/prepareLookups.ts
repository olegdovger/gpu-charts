import { assert } from "@gpu-charts/core";
import { Vec2 } from "../math/Vec2.ts";
import { Vec4 } from "../math/Vec4.ts";
import { packShelves } from "../math/packShelves.ts";
import { calculateGlyphQuads } from "./calculateGlyphQuads.ts";
import { ATLAS_FONT_SIZE, ATLAS_GAP } from "./renderFontAtlas.ts";

export function prepareLookups(
  ttf: TTFSource,
  options?: {
    alphabet?: string;
  }
): Lookups {
  const scale = (1 / ttf.head.unitsPerEm) * ATLAS_FONT_SIZE;
  const glyphs = calculateGlyphQuads(ttf, options?.alphabet);

  const transform = (x: number): number => Math.ceil(x * scale);
  const sizes = glyphs.map(
    (g) =>
      new Vec2(
        transform(g.width) + ATLAS_GAP * 2,
        transform(g.height) + ATLAS_GAP * 2
      )
  );
  const packing = packShelves(sizes);
  assert(
    packing.positions.length === glyphs.length,
    `Packing produced different number of positions than expected.`
  );

  const atlas = {
    width: packing.width,
    height: packing.height,
    positions: packing.positions,
    sizes,
  };

  const uvs: Vec4[] = [];

  for (let i = 0; i < glyphs.length; i++) {
    const position = atlas.positions[i];
    const size = atlas.sizes[i];

    uvs.push(
      new Vec4(
        position.x / atlas.width,
        position.y / atlas.height,
        size.x / atlas.width,
        size.y / atlas.height
      )
    );
  }

  const glyphMap = new Map<number, Glyph>();
  for (const glyph of glyphs) {
    glyphMap.set(glyph.id, glyph);
  }

  const uvMap = new Map<number, Vec4>();
  for (let i = 0; i < glyphs.length; i++) {
    uvMap.set(glyphs[i].id, uvs[i]);
  }

  const kerningPairs = new Map<number, Map<number, number>>();
  let firstGlyphClassMapping = new Map<number, number>();
  let secondGlyphClassMapping = new Map<number, number>();

  let classRecords: {
    value1?: ValueRecord | undefined;
    value2?: ValueRecord | undefined;
  }[][] = [];

  const kern = ttf.GPOS?.features.find((f) => f.tag === "kern");
  if (kern) {
    const lookups = kern.lookupListIndices.map((id) => ttf.GPOS?.lookups[id]);

    for (const lookup of lookups) {
      if (lookup && (lookup.lookupType === 2 || lookup.lookupType === 9)) {
        // Ensure it's Pair Adjustment
        for (const subtable of lookup.subtables) {
          if (lookup.lookupType === 9 && subtable.extensionLookupType === 2) {
            const coverage = subtable.extension.coverage;

            if (subtable.extension.posFormat === 1) {
              // Adjustment for glyph pairs.
              const pairSets = subtable.extension.pairSets;

              if (coverage.coverageFormat === 2) {
                let indexCounter = 0;
                for (const range of coverage.rangeRecords) {
                  for (
                    let glyphID = range.startGlyphID;
                    glyphID <= range.endGlyphID;
                    glyphID++
                  ) {
                    const pairs = pairSets[indexCounter];

                    const glyphKernMap =
                      kerningPairs.get(glyphID) || new Map<number, number>();
                    for (const pair of pairs) {
                      if (pair.value1?.xAdvance) {
                        glyphKernMap.set(
                          pair.secondGlyph,
                          pair.value1.xAdvance
                        );
                      }
                    }
                    if (glyphKernMap.size > 0) {
                      kerningPairs.set(glyphID, glyphKernMap);
                    }

                    indexCounter++;
                  }
                }
              } else {
                console.warn(
                  `Coverage format ${coverage.coverageFormat} is not supported.`
                );
              }
            } else if (subtable.extension.posFormat === 2) {
              // Adjustment for glyph classes.
              if (coverage.coverageFormat === 2) {
                const { classDef1, classDef2 } = subtable.extension;
                firstGlyphClassMapping = generateGlyphToClassMap(classDef1);
                secondGlyphClassMapping = generateGlyphToClassMap(classDef2);
                classRecords = subtable.extension.classRecords;
              } else {
                console.warn(
                  `Coverage format ${coverage.coverageFormat} is not supported.`
                );
              }
            }
          }
        }
      }
    }
  }

  return {
    atlas,
    unitsPerEm: ttf.head.unitsPerEm,
    capHeight: ttf.hhea.ascender + ttf.hhea.descender,
    ascender: ttf.hhea.ascender,
    glyphs: glyphMap,
    uvs: uvMap,
    kern: (firstCharacter: number, secondCharacter: number): number => {
      if (!ttf.GPOS) {
        return 0;
      }

      const firstGlyphID = ttf.cmap.glyphIndexMap.get(firstCharacter);
      const secondGlyphID = ttf.cmap.glyphIndexMap.get(secondCharacter);
      assert(firstGlyphID, `Glyph not found for: "${firstCharacter}"`);
      assert(secondGlyphID, `Glyph not found for: "${secondCharacter}"`);

      const firstMap = kerningPairs.get(firstGlyphID);
      if (firstMap) {
        if (firstMap.get(secondGlyphID)) {
          return firstMap.get(secondGlyphID) ?? 0;
        }
      }

      const firstClass = firstGlyphClassMapping.get(firstGlyphID);
      const secondClass = secondGlyphClassMapping.get(secondGlyphID);

      if (firstClass && secondClass) {
        const record = classRecords[firstClass][secondClass];
        return record.value1?.xAdvance ?? 0;
      }

      return 0;
    },
    ttf,
  };
}

function generateGlyphToClassMap(
  classDef: ClassDefFormat1 | ClassDefFormat2
): Map<number, number> {
  const glyphToClass = new Map<number, number>();

  if (classDef.format === 1) {
    // ClassDefFormat1
    let glyphID = classDef.startGlyph;
    for (const classValue of classDef.classes) {
      glyphToClass.set(glyphID, classValue);
      glyphID++;
    }
  } else if (classDef.format === 2) {
    // ClassDefFormat2
    for (const range of classDef.ranges) {
      for (
        let glyphID = range.startGlyphID;
        glyphID <= range.endGlyphID;
        glyphID++
      ) {
        glyphToClass.set(glyphID, range.class);
      }
    }
  }

  return glyphToClass;
}
