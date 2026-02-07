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
  sanitize?: boolean;
  /**
   * When true, writes outputs into platform subfolders:
   * - <dest>/ios/<fontName>.ttf
   * - <dest>/android/<fontName>.ttf
   */
  platformSubfolders?: boolean;
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
