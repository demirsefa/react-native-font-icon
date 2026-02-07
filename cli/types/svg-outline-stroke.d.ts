declare module 'svg-outline-stroke' {
  export type OutlineStrokeParams = Record<string, unknown>;
  export type OutlineStrokeInput = string | Buffer;
  export type OutlineStrokeFn = (
    input: OutlineStrokeInput,
    params?: OutlineStrokeParams
  ) => Promise<string>;

  const outlineStroke: OutlineStrokeFn;
  export default outlineStroke;
}

