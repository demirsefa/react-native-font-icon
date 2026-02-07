import { Text, type TextProps, StyleSheet } from 'react-native';
import { useFontIconContext } from '../hooks/useFontIconContext';
import React from 'react';

interface IconProps<T extends string> extends TextProps {
  name: T;
  family?: string;
  fallbackProps?: Record<string, unknown>;
}

function Icon<T extends string>({
  name,
  family,
  style,
  fallbackProps,
}: IconProps<T>) {
  const { fontData } = useFontIconContext();
  const fontEntries = Array.isArray(fontData)
    ? fontData
    : Object.values(fontData);
  const fallbackFamily = fontEntries[0]?.family ?? '';
  const resolvedFamily = family ?? fallbackFamily;

  if (!resolvedFamily) {
    return <Text style={style}>X</Text>;
  }
  const fontEntry = fontEntries.find(
    (entry) => entry.family === resolvedFamily
  );

  if (!fontEntry) {
    return <Text style={style}>X</Text>;
  }

  const fallback = fontEntry.fallback;
  if (fallback?.names?.includes(name)) {
    const FallbackComponent = fallback.component;
    return <FallbackComponent {...fallbackProps} style={style} />;
  }

  const glyphMap = fontEntry.glyphMap;
  const iconCode = glyphMap[name];

  if (!iconCode) {
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
    fontWeight: '100',
    fontSize: 32,
  },
});

export default React.memo(Icon);
