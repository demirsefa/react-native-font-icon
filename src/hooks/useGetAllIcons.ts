import { useFontIconContext } from './useFontIconContext';

export function useGetAllIcons(): string[] {
  const fontData = useFontIconContext();
  return Object.keys(fontData.fontData);
}
