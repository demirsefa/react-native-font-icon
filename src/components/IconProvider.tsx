import { createContext, type ReactNode, useMemo } from 'react';

type FontGlyphMap = Record<string, number>;
export type FontDataEntry = {
  family: string;
  glyphMap: FontGlyphMap;
};
export type FontGlyphCollection =
  | ReadonlyArray<FontDataEntry>
  | Record<string, FontDataEntry>;

export type FontIconContextType = {
  fontData: FontGlyphCollection;
  fontEntries: ReadonlyArray<FontDataEntry>;
  fontEntryByFamily: Map<string, FontDataEntry>;
  fallbackFamily: string;
};

export const FontIconContext = createContext<FontIconContextType | undefined>(
  undefined
);

export interface IconProviderProps {
  /**
   * List or map of font families with glyph maps.
   */
  fontData: FontGlyphCollection;
  children: ReactNode;
}

export function IconProvider(props: IconProviderProps) {
  const fontEntries = useMemo(
    () =>
      Array.isArray(props.fontData)
        ? props.fontData
        : Object.values(props.fontData),
    [props.fontData]
  );
  const fontEntryByFamily = useMemo(() => {
    const entries = new Map<string, FontDataEntry>();
    fontEntries.forEach((entry) => {
      entries.set(entry.family, entry);
    });
    return entries;
  }, [fontEntries]);
  const fallbackFamily = useMemo(
    () => fontEntries[0]?.family ?? '',
    [fontEntries]
  );

  const contextValue = useMemo(
    () => ({
      fontData: props.fontData,
      fontEntries,
      fontEntryByFamily,
      fallbackFamily,
    }),
    [props.fontData, fontEntries, fontEntryByFamily, fallbackFamily]
  );

  return (
    <FontIconContext.Provider value={contextValue}>
      {props.children}
    </FontIconContext.Provider>
  );
}
