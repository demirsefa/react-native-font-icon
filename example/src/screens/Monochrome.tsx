import { useCallback, useMemo } from 'react';
import { View, FlatList, type ListRenderItem } from 'react-native';
import { Icon, useGetAllIcons } from 'react-native-font-icon';
import { NavigationDebugInfo } from '../components/NavigationDebugInfo';
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
  const allIcons = useGetAllIcons('custom-font-monochrome-inkscape');
  const sharedStyles = useMemo(
    () => getSharedStyles(iconSize, numColumns, colorful),
    [iconSize, numColumns, colorful]
  );

  const renderItem: ListRenderItem<string> = useCallback(
    ({ item: icon }) => (
      <View style={sharedStyles.iconContainer}>
        <Icon style={sharedStyles.icon} name={icon} />
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
