import { Text, type TextProps } from 'react-native';
import { useFontIconContext } from '../hooks/useFontIconContext';
import React from 'react';

interface IconProps<T extends string> extends TextProps {
  name: T;
  family?: string;
}

function Icon<T extends string>({ name, family, style }: IconProps<T>) {
  const { fontFamilyName, fontData } = useFontIconContext();
  const fallbackFamily = fontFamilyName?.[0] ?? fontFamilyName;
  const resolvedFamily = family ?? fallbackFamily;

  if (!resolvedFamily) {
    return <Text style={style}>X</Text>;
  }
  const glyphMap = fontData[resolvedFamily as keyof typeof fontData];

  if (!glyphMap) {
    return <Text style={style}>X</Text>;
  }

  const iconCode = glyphMap[name];

  if (!iconCode) {
    throw new Error(`Icon ${name} not found for "${resolvedFamily}"`);
  }

  return (
    <Text
      style={{
        fontFamily: resolvedFamily as string,
        fontWeight: '100',
        fontSize: 32,
      }}
    >
      {String.fromCharCode(iconCode)}
    </Text>
  );
}

export default React.memo(Icon);
