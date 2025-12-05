import { createContext, type ReactNode } from 'react';

type FontGlyphMap = Record<string, number>;
type FontGlyphCollection = Record<string, FontGlyphMap>;

export type FontIconContextType = {
  fontFamilyName: string | string[];
  fontData: FontGlyphCollection;
};

export const FontIconContext = createContext<FontIconContextType | undefined>(
  undefined
);

type BaseIconProviderProps = { children: ReactNode };

type SingleIconProviderProps = BaseIconProviderProps & {
  fontFamilyName: string;
  fontData: FontGlyphMap;
};

type MultiIconProviderProps = BaseIconProviderProps & {
  fontFamilyName: string[];
  fontData: FontGlyphCollection;
};

type IconProviderProps = SingleIconProviderProps | MultiIconProviderProps;

function isMultiIconProviderProps(
  props: IconProviderProps
): props is MultiIconProviderProps {
  return Array.isArray(props.fontFamilyName);
}

export function IconProvider(props: IconProviderProps) {
  let normalizedFontData: FontGlyphCollection;

  if (isMultiIconProviderProps(props)) {
    normalizedFontData = props.fontData;
    const missing = props.fontFamilyName.filter(
      (family) => !normalizedFontData[family]
    );
    if (missing.length > 0) {
      throw new Error(
        `IconProvider is missing font data for: ${missing.join(', ')}`
      );
    }
  } else {
    normalizedFontData = { [props.fontFamilyName]: props.fontData };
  }
  return (
    <FontIconContext.Provider
      value={{
        fontFamilyName: props.fontFamilyName,
        fontData: normalizedFontData,
      }}
    >
      {props.children}
    </FontIconContext.Provider>
  );
}
