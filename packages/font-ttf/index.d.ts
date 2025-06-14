/// <reference types="@webgpu/types" />

interface Glyph {
  /**
   * Unicode code point. Do not confuse with TTF glyph index.
   */
  id: number;
  character: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * Left side bearing.
   */
  lsb: number;
  /**
   * Right side bearing.
   */
  rsb: number;
}

interface TTFSource {
  head: HeadTable;
  hhea: HheaTable;
  hmtx: HmtxTable;
  maxp: MaxpTable;
  cmap: CmapTable;
  loca: LocaTable;
  glyf: GlyfTable;
  GPOS?: GPOSTable;
}

interface HeadTable {
  majorVersion: Uint16;
  minorVersion: Uint16;
  fontRevision: Fixed;
  checksumAdjustment: Uint32;
  magicNumber: Uint32;
  flags: Uint16;
  unitsPerEm: Uint16;
  created: Date;
  modified: Date;
  yMin: FWord;
  xMin: FWord;
  xMax: FWord;
  yMax: FWord;
  macStyle: Uint16;
  lowestRecPPEM: Uint16;
  fontDirectionHint: Int16;
  indexToLocFormat: Int16;
  glyphDataFormat: Int16;
}

type CmapTable = {
  version: Uint16;
  numTables: Uint16;
  encodingRecords: {
    platformID: Uint16;
    encodingID: Uint16;
    offset: Uint32;
  }[];
  format: Uint16;
  length: Uint16;
  language: Uint16;
  segCountX2: Uint16;
  segCount: Uint16;
  searchRange: Uint16;
  entrySelector: Uint16;
  rangeShift: Uint16;
  endCodes: Uint16[];
  startCodes: Uint16[];
  idDeltas: Int16[];
  idRangeOffsets: Uint16[];
  glyphIndexMap: Map<number, number>;
};

type MaxpTable = {
  version: "0.5" | "1.0";
  numGlyphs: Uint16;
};

type HheaTable = {
  majorVersion: Uint16;
  minorVersion: Uint16;
  ascender: FWord;
  descender: FWord;
  lineGap: FWord;
  advanceWidthMax: Uint16;
  minLeftSideBearing: FWord;
  minRightSideBearing: FWord;
  xMaxExtent: FWord;
  caretSlopeRise: Int16;
  caretSlopeRun: Int16;
  caretOffset: FWord;
  reserved1: Int16;
  reserved2: Int16;
  reserved3: Int16;
  reserved4: Int16;
  metricDataFormat: Int16;
  numberOfHMetrics: Uint16;
};

type HmtxTable = {
  hMetrics: {
    advanceWidth: Uint16;
    leftSideBearing: Int16;
  }[];
  leftSideBearings: FWord[];
};

type LocaTable = {
  offsets: number[];
};

type GlyfTable = {
  numberOfContours: Int16;
  xMin: FWord;
  yMin: FWord;
  xMax: FWord;
  yMax: FWord;
}[];

type GPOSTable = {
  features: Array<{
    tag: string;
    paramsOffset: number;
    lookupListIndices: number[];
  }>;
  lookups: Array<GPOSLookup>;
};

type GPOSLookup = {
  lookupType: number;
  lookupFlag: number;
  subtables: Array<{
    posFormat: number;
    extensionLookupType: number;
    extension: ExtensionLookupType2Format1 | ExtensionLookupType2Format2;
  }>;
  markFilteringSet?: number;
};

type ValueRecord = {
  xPlacement?: number;
  yPlacement?: number;
  xAdvance?: number;
  yAdvance?: number;
  xPlaDevice?: number;
  yPlaDevice?: number;
  xAdvDevice?: number;
  yAdvDevice?: number;
};

type ExtensionLookupType2Format1 = {
  posFormat: 1;
  coverage: CoverageTableFormat1 | CoverageTableFormat2;
  valueFormat1: number;
  valueFormat2: number;
  pairSets: Array<
    Array<{
      secondGlyph: number;
      value1?: ValueRecord;
      value2?: ValueRecord;
    }>
  >;
};

type ClassDefFormat1 = {
  format: 1;
  startGlyph: number;
  classes: number[];
};

type ClassDefFormat2 = {
  format: 2;
  ranges: Array<{
    startGlyphID: number;
    endGlyphID: number;
    class: number;
  }>;
};

type ExtensionLookupType2Format2 = {
  posFormat: 2;
  coverage: CoverageTableFormat1 | CoverageTableFormat2;
  valueFormat1: number;
  valueFormat2: number;
  classDef1: ClassDefFormat1 | ClassDefFormat2;
  classDef2: ClassDefFormat1 | ClassDefFormat2;
  classRecords: Array<
    Array<{
      value1?: ValueRecord;
      value2?: ValueRecord;
    }>
  >;
};

/**
 * https://learn.microsoft.com/en-us/typography/opentype/spec/chapter2#coverage-table
 */
type CoverageTableFormat1 = {
  coverageFormat: 1;
  glyphArray: number[];
};

type CoverageTableFormat2 = {
  coverageFormat: 2;
  rangeRecords: Array<{
    startGlyphID: number;
    endGlyphID: number;
    startCoverageIndex: number;
  }>;
};

type Lookups = {
  unitsPerEm: number;
  capHeight: number;
  ascender: number;
  glyphs: Map<number, Glyph>;
  uvs: Map<number, Vec4>;
  atlas: {
    width: number;
    height: number;
    positions: Vec2[];
    sizes: Vec2[];
  };
  kern: (firstCharacter: number, secondCharacter: number) => number;
  ttf: TTFSource;
};

type Shape = {
  boundingRectangle: { width: number; height: number };
  positions: Vec2[];
  sizes: Vec2[];
};

type Uint8 = number;
type Uint16 = number;
type Uint32 = number;
type Int16 = number;
type Int32 = number;
type FWord = Int16;
type Fixed = number;
