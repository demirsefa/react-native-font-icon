import { createContext, type ReactNode, type FC } from 'react';

type FontGlyphMap = Record<string, number>;
export type FontDataEntry = {
  family: string;
  glyphMap: FontGlyphMap;
  /**
   * Optional fallback render for icons that should use SVG instead of fonts.
   */
  fallback?: {
    names: string[];
    component: FC<any>;
  };
};
export type FontGlyphCollection =
  | ReadonlyArray<FontDataEntry>
  | Record<string, FontDataEntry>;

export type FontIconContextType = {
  fontData: FontGlyphCollection;
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
