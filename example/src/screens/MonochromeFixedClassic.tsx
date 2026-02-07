import { useCallback, useMemo } from 'react';
import { View, FlatList, type ListRenderItem } from 'react-native';
import { Icon } from 'react-native-font-icon';
import monochromeFamily from '../assets/fonts/custom-font-monochrome-inkscape.json';
import { NavigationDebugInfo } from '../components/NavigationDebugInfo';
import { getSharedStyles } from './sharedStyles';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Router';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'MonochromeFixedClassic'
>;

export default function MonochromeFixedClassic({ route }: Props) {
  const {
    iconSize = 16,
    numColumns = 12,
    colorful = false,
  } = route.params || {};
  const allIcons = useMemo(() => Object.keys(monochromeFamily), []);
  const sharedStyles = useMemo(
    () => getSharedStyles(iconSize, numColumns, colorful),
    [iconSize, numColumns, colorful]
  );

  const renderItem: ListRenderItem<string> = useCallback(
    ({ item: icon }) => (
      <View style={sharedStyles.iconContainer}>
        <Icon
          style={sharedStyles.icon}
          name={icon}
          family="custom-font-monochrome-inkscape"
        />
      </View>
    ),
    [sharedStyles]
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
      <NavigationDebugInfo
        counterId={`debugNavigationStarted-${route.name}`}
        styles={sharedStyles}
      />
    </View>
  );
}
