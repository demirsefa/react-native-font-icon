import { useEffect, useLayoutEffect, useMemo } from 'react';
import { View, Text, FlatList, type ListRenderItem } from 'react-native';
import colorGlyphMapJson from '../assets/fonts/color-family-glyphmap.json';
import {
  ColorIconClassic,
  type ColorIconClassicName,
} from '../components/ColorIconClassic';
import { useDebugContext } from '../contexts/DebugContext';
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
  const { counters, updateCounter } = useDebugContext();
  const sharedStyles = useMemo(
    () => getSharedStyles(iconSize, numColumns, colorful),
    [iconSize, numColumns, colorful]
  );

  useLayoutEffect(() => {
    const navCounter = counters.find(
      (c) => c.id === 'debugNavigationStarted-ColorFontsClassic'
    );
    if (navCounter && navCounter.useLayoutEffectTime === null) {
      const time = performance.now() - navCounter.startTime;
      updateCounter(navCounter.id, { useLayoutEffectTime: time });
    }
  }, [counters, updateCounter]);

  useEffect(() => {
    const navCounter = counters.find(
      (c) => c.id === 'debugNavigationStarted-ColorFontsClassic'
    );
    if (navCounter && navCounter.useEffectTime === null) {
      const time = performance.now() - navCounter.startTime;
      updateCounter(navCounter.id, { useEffectTime: time });
    }
  }, [counters, updateCounter]);

  const navCounter = counters.find(
    (c) => c.id === 'debugNavigationStarted-ColorFontsClassic'
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

  const debugComponent = useMemo(
    () =>
      navCounter ? (
        <View style={sharedStyles.debugSection}>
          <Text style={sharedStyles.debugTitle}>Render</Text>
          <View style={sharedStyles.counterItem}>
            <Text style={sharedStyles.counterId}>{navCounter.id}</Text>
            <Text style={sharedStyles.counterText}>
              layout:{' '}
              {navCounter.useLayoutEffectTime !== null
                ? `${navCounter.useLayoutEffectTime.toFixed(1)}ms`
                : '...'}
            </Text>
            <Text style={sharedStyles.counterText}>
              effect:{' '}
              {navCounter.useEffectTime !== null
                ? `${navCounter.useEffectTime.toFixed(1)}ms`
                : '...'}
            </Text>
          </View>
        </View>
      ) : null,
    [navCounter, sharedStyles]
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
      {debugComponent}
    </View>
  );
}
