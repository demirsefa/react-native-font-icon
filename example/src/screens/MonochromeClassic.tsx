import { useEffect, useLayoutEffect, useMemo } from 'react';
import { View, Text, FlatList, type ListRenderItem } from 'react-native';
import icons from '../assets/fonts/font-family.json';
import { IconClassic, type IconClassicName } from '../components/IconClassic';
import { useDebugContext } from '../contexts/DebugContext';
import { getSharedStyles } from './sharedStyles';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Router';

type Props = NativeStackScreenProps<RootStackParamList, 'MonochromeClassic'>;

export default function MonochromeClassic({ route }: Props) {
  const {
    iconSize = 16,
    numColumns = 12,
    colorful = false,
  } = route.params || {};
  const allIcons = Object.keys(icons);
  const { counters, updateCounter } = useDebugContext();
  const sharedStyles = useMemo(
    () => getSharedStyles(iconSize, numColumns, colorful),
    [iconSize, numColumns, colorful]
  );

  // Measure useLayoutEffect timing for navigation counter
  useLayoutEffect(() => {
    const navCounter = counters.find(
      (c) => c.id === 'debugNavigationStarted-MonochromeClassic'
    );
    if (navCounter && navCounter.useLayoutEffectTime === null) {
      const time = performance.now() - navCounter.startTime;
      updateCounter(navCounter.id, { useLayoutEffectTime: time });
    }
  }, [counters, updateCounter]);

  // Measure useEffect timing for navigation counter
  useEffect(() => {
    const navCounter = counters.find(
      (c) => c.id === 'debugNavigationStarted-MonochromeClassic'
    );
    if (navCounter && navCounter.useEffectTime === null) {
      const time = performance.now() - navCounter.startTime;
      updateCounter(navCounter.id, { useEffectTime: time });
    }
  }, [counters, updateCounter]);

  const navCounter = counters.find(
    (c) => c.id === 'debugNavigationStarted-MonochromeClassic'
  );

  const renderItem: ListRenderItem<string> = ({ item: icon }) => (
    <View style={sharedStyles.iconContainer}>
      <IconClassic
        width={iconSize}
        height={iconSize}
        color={colorful ? '#ff0000' : undefined}
        name={icon as IconClassicName}
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
        data={allIcons}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        numColumns={numColumns}
      />
      {debugComponent}
    </View>
  );
}
