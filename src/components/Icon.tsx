import { Text, type TextProps, StyleSheet } from 'react-native';
import { useFontIconContext } from '../hooks/useFontIconContext';
import React from 'react';

interface IconProps<T extends string> extends TextProps {
  name: T;
  family?: string;
}

function Icon<T extends string>({ name, family, style }: IconProps<T>) {
  const { fontEntryByFamily, fallbackFamily } = useFontIconContext();
  const resolvedFamily = family ?? fallbackFamily;

  if (!resolvedFamily) {
    return <Text style={style}>X</Text>;
  }
  const fontEntry = fontEntryByFamily.get(resolvedFamily);

  if (!fontEntry) {
    return <Text style={style}>X</Text>;
  }

  const glyphMap = fontEntry.glyphMap;
  const iconCode = glyphMap[name];

  if (iconCode == null) {
    throw new Error(`Icon ${name} not found for "${resolvedFamily}"`);
  }

  return (
    <Text style={[styles.icon, { fontFamily: resolvedFamily }, style]}>
      {String.fromCharCode(iconCode)}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 32,
  },
});

export default React.memo(Icon);
