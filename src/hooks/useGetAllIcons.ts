import { useMemo } from 'react';
import { useFontIconContext } from './useFontIconContext';

export function useGetAllIcons(family: string): string[] {
  const { fontEntryByFamily } = useFontIconContext();
  return useMemo(() => {
    const fontEntry = fontEntryByFamily.get(family);
    if (!fontEntry) {
      return [];
    }
    return Object.keys(fontEntry.glyphMap);
  }, [fontEntryByFamily, family]);
}
