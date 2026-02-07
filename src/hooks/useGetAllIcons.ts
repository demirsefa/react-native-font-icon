import { useMemo } from 'react';
import { useFontIconContext } from './useFontIconContext';

export function useGetAllIcons(family: string): string[] {
  const { fontData } = useFontIconContext();
  return useMemo(() => {
    const fontEntries = Array.isArray(fontData)
      ? fontData
      : Object.values(fontData);
    const fontEntry = fontEntries.find((entry) => entry.family === family);
    if (!fontEntry) {
      return [];
    }
    return Object.keys(fontEntry.glyphMap);
  }, [fontData, family]);
}
