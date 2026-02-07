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
   * - paper: best-effort JS transform (may be lossy)
   */
  sanitizeEngine?: 'inkscape' | 'paper';
  /**
   * EXPERIMENTAL: override inkscape binary path.
   */
  inkscape?: string;
};

export type StorageShape = {
  folderLastChangeDate: string | null;
  fontFamilyHash: string | null;
  fontName: string;
};
