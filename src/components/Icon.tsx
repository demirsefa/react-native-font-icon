import { Text, StyleSheet, type TextProps } from 'react-native';
import { useFontIconContext } from '../hooks/useFontIconContext';

interface IconProps<T extends string> extends TextProps {
  name: T;
}

export function Icon<T extends string>({ name, style }: IconProps<T>) {
  const { fontFamilyName, fontData } = useFontIconContext();
  const iconCode = fontData[name];
  if (!iconCode) {
    throw new Error(`Icon ${name} not found`);
  }
  return (
    <Text style={[styles.icon, { fontFamily: fontFamilyName }, style]}>
      {String.fromCharCode(iconCode)}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontFamily: 'font-family',
  },
});
