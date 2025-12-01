import { Text, StyleSheet } from 'react-native';
import { useFontIconContext } from '../hooks/useFontIconContext';

type IconProps<T extends string> = {
  name: T;
};

export function Icon<T extends string>({ name }: IconProps<T>) {
  const { fontFamilyName, fontData } = useFontIconContext();
  const iconCode = fontData[name];
  if (!iconCode) {
    throw new Error(`Icon ${name} not found`);
  }
  return (
    <Text style={[styles.icon, { fontFamily: fontFamilyName }]}>
      {String.fromCharCode(iconCode)}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontFamily: 'font-family',
  },
});
