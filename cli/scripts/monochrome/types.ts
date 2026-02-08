export type MonochromeParams = {
  src: string;
  dest: string;
  fontName?: string;
  /**
   * Limit number of icons processed (useful for quick tests).
   */
  max?: number;
  /**
   * EXPERIMENTAL: pre-process SVGs before compilation.
   */
  sanitize?: boolean;
  /**
   * EXPERIMENTAL: sanitize engine to use.
   * - inkscape: highest fidelity (requires inkscape installed)
   */
  sanitizeEngine?: 'inkscape';
  /**
   * EXPERIMENTAL: override inkscape binary path.
   */
  inkscape?: string;
  /**
   * EXPERIMENTAL: run a post-process outline pass after inkscape.
   * Off by default to preserve inkscape output.
   */
  inkscapeOutline?: boolean;
};

export type StorageShape = {
  folderLastChangeDate: string | null;
  fontFamilyHash: string | null;
  fontName: string;
};
