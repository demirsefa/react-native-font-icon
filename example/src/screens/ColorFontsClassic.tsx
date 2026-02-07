import { useMemo } from 'react';
import { View, FlatList, type ListRenderItem } from 'react-native';
import colorGlyphMapJson from '../assets/fonts/custom-font-colors-glyphmap.json';
import {
  ColorIconClassic,
  type ColorIconClassicName,
} from '../components/ColorIconClassic';
import { NavigationDebugInfo } from '../components/NavigationDebugInfo';
import { getSharedStyles } from './sharedStyles';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Router';

type ColorGlyph = {
  name: string;
  codepoint: number;
};

const colorGlyphMap = colorGlyphMapJson as ColorGlyph[];

const colorIconNames = colorGlyphMap.map((glyph) => glyph.name);

type Props = NativeStackScreenProps<RootStackParamList, 'ColorFontsClassic'>;

export default function ColorFontsClassic({ route }: Props) {
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
      <ColorIconClassic
        width={iconSize}
        height={iconSize}
        // Allow a simple single-color override if desired, even though
        // these are full-color SVGs. This mirrors MonochromeClassic's API.
        color={colorful ? '#ff0000' : undefined}
        name={icon as ColorIconClassicName}
      />
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
