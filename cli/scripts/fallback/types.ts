export type FallbackParams = {
  /**
   * Folder containing SVG icons.
   * Defaults to example assets folder when omitted.
   */
  src?: string;
  /**
   * Destination JSON file path for fallback icon names (string[]).
   */
  destJson?: string;
  /**
   * Destination TSX file path for generated FallBackIcon component.
   */
  destComponent?: string;
};
