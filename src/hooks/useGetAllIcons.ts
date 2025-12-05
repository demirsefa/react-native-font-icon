import { useFontIconContext } from './useFontIconContext';

export function useGetAllIcons(family: string): string[] {
  const { fontData } = useFontIconContext();
  //TODO: fix
  //@ts-ignore
  return Object.keys(fontData[family as keyof typeof fontData]);
}
