import { createContext, type ReactNode } from 'react';

export type FontIconContextType = {
  fontFamilyName: string;
  fontData: Record<string, number>;
};

export const FontIconContext = createContext<FontIconContextType | undefined>(
  undefined
);

type IconProviderProps = {
  fontFamilyName: string;
  fontData: Record<string, number>;
  children: ReactNode;
};

export function IconProvider({
  fontFamilyName,
  fontData,
  children,
}: IconProviderProps) {
  return (
    <FontIconContext.Provider value={{ fontFamilyName, fontData }}>
      {children}
    </FontIconContext.Provider>
  );
}
