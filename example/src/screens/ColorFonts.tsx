import { useMemo } from 'react';
import { View, FlatList, type ListRenderItem } from 'react-native';
import { Icon } from 'react-native-font-icon';
import colorGlyphMapJson from '../assets/fonts/custom-font-colors-glyphmap.json';
import { NavigationDebugInfo } from '../components/NavigationDebugInfo';
import { getSharedStyles } from './sharedStyles';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Router';

type ColorGlyph = {
  name: string;
  codepoint: number;
};

const colorGlyphMap = colorGlyphMapJson as ColorGlyph[];

const colorFontData = colorGlyphMap.reduce<Record<string, number>>(
  (acc, glyph) => {
    acc[glyph.name] = glyph.codepoint;
    return acc;
  },
  {}
);

const colorIconNames = colorGlyphMap.map((glyph) => glyph.name);

type Props = NativeStackScreenProps<RootStackParamList, 'ColorFonts'>;

export default function ColorFonts({ route }: Props) {
  const {
    iconSize = 16,
    numColumns = 12,
    colorful = false,
  } = route.params || {};
  const sharedStyles = useMemo(
    () => getSharedStyles(iconSize, numColumns, colorful),
    [iconSize, numColumns, colorful]
  );

  const renderItem: ListRenderItem<string> = ({ item: icon }) => (
    <View style={sharedStyles.iconContainer}>
      <Icon family="custom-font-colors" style={sharedStyles.icon} name={icon} />
    </View>
  );

  return (
    <View style={sharedStyles.container}>
      <FlatList
        style={sharedStyles.container}
        data={colorIconNames}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        numColumns={numColumns}
      />
      <NavigationDebugInfo
        counterId={`debugNavigationStarted-${route.name}`}
        styles={sharedStyles}
      />
    </View>
  );
}
