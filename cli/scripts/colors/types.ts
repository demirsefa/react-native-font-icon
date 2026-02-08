export type ColorsParams = {
  /**
   * Positional arguments.
   */
  src?: string;
  dest?: string;

  /**
   * Named options (optional).
   */
  python?: string;
  fontName?: string;
  /**
   * Limit number of icons processed (useful for quick tests).
   */
  max?: number;
  /**
   * Optional base folder for platform outputs:
   * - <platformBasePath>/ios/<fontName>.ttf
   * - <platformBasePath>/android/<fontName>.ttf
   */
  platformBasePath?: string;
};

export type ColorTarget = {
  format: string;
  extension: string;
  label: 'android' | 'ios';
};

export type GlyphMapping = {
  originalPath: string;
  name: string;
  codepoint: number;
  stagedFile: string;
};

export type GeneratedConfig = {
  configPath: string;
  outputFile: string;
  label: 'android' | 'ios';
  extension: string;
};

export type GeneratedFontOutput = {
  platform: 'android' | 'ios';
  path: string;
};

export type ColorsStorageShape = {
  folderLastChangeDate: string | null;
  glyphMapHash: string | null;
  fontName: string;
  outputs: GeneratedFontOutput[];
};
