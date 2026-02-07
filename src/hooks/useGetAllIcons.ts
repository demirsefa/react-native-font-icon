import { useMemo } from 'react';
import { useFontIconContext } from './useFontIconContext';

export function useGetAllIcons(family: string): string[] {
  const { fontData } = useFontIconContext();
  return useMemo(() => {
    const fontGlyphMap = fontData[family as keyof typeof fontData];
    if (!fontGlyphMap) {
      return [];
    }
    return Object.keys(fontGlyphMap);
  }, [fontData, family]);
}
