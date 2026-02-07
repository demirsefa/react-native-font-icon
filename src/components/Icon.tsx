import { Text, type TextProps, StyleSheet } from 'react-native';
import { useFontIconContext } from '../hooks/useFontIconContext';
import React from 'react';

interface IconProps<T extends string> extends TextProps {
  name: T;
  family?: string;
}

function Icon<T extends string>({ name, family, style }: IconProps<T>) {
  const { fontData } = useFontIconContext();
  const fallbackFamily = (Object.keys(fontData)[0] as string | undefined) ?? '';
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
      style={[styles.icon, { fontFamily: resolvedFamily as string }, style]}
    >
      {String.fromCharCode(iconCode)}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontWeight: '100',
    fontSize: 32,
  },
});

export default React.memo(Icon);
