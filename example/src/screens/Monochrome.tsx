import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { View, Text, FlatList, type ListRenderItem } from 'react-native';
import { Icon, useGetAllIcons } from 'react-native-font-icon';
import { useDebugContext } from '../contexts/DebugContext';
import { getSharedStyles } from './sharedStyles';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Router';

type Props = NativeStackScreenProps<RootStackParamList, 'Monochrome'>;

/**
 * flowbite icons used in this screen.
 * @see https://flowbite.com/icons/
 * https://www.figma.com/community/file/1253280241668899805/flowbite-icons-750-free-svg-icons-in-figma
 */
export default function Monochrome({ route }: Props) {
  const {
    iconSize = 16,
    numColumns = 12,
    colorful = false,
  } = route.params || {};
  const allIcons = useGetAllIcons('font-family');
  console.log('allIcons', allIcons);
  const { counters, updateCounter } = useDebugContext();
  const sharedStyles = useMemo(
    () => getSharedStyles(iconSize, numColumns, colorful),
    [iconSize, numColumns, colorful]
  );

  // Measure useLayoutEffect timing for navigation counter
  useLayoutEffect(() => {
    const navCounter = counters.find(
      (c) => c.id === 'debugNavigationStarted-Monochrome'
    );
    if (navCounter && navCounter.useLayoutEffectTime === null) {
      const time = performance.now() - navCounter.startTime;
      updateCounter(navCounter.id, { useLayoutEffectTime: time });
    }
  }, [counters, updateCounter]);

  // Measure useEffect timing for navigation counter
  useEffect(() => {
    const navCounter = counters.find(
      (c) => c.id === 'debugNavigationStarted-Monochrome'
    );
    if (navCounter && navCounter.useEffectTime === null) {
      const time = performance.now() - navCounter.startTime;
      updateCounter(navCounter.id, { useEffectTime: time });
    }
  }, [counters, updateCounter]);

  const navCounter = counters.find(
    (c) => c.id === 'debugNavigationStarted-Monochrome'
  );

  const renderItem: ListRenderItem<string> = useCallback(
    ({ item: icon }) => (
      <View style={sharedStyles.iconContainer}>
        <Icon style={sharedStyles.icon} name={icon} />
      </View>
    ),
    [sharedStyles]
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
