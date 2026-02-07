import { createContext, type ReactNode } from 'react';

type FontGlyphMap = Record<string, number>;
export type FontGlyphCollection = Record<string, FontGlyphMap>;

export type FontIconContextType = {
  fontData: FontGlyphCollection;
};

export const FontIconContext = createContext<FontIconContextType | undefined>(
  undefined
);

export interface IconProviderProps {
  /**
   * Map of font family name -> glyph map.
   * For a single font, just pass an object with one key.
   */
  fontData: FontGlyphCollection;
  children: ReactNode;
}

export function IconProvider(props: IconProviderProps) {
  return (
    <FontIconContext.Provider
      value={{
        fontData: props.fontData,
      }}
    >
      {props.children}
    </FontIconContext.Provider>
  );
}
