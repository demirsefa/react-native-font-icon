import { useMemo } from 'react';
import { View, FlatList, type ListRenderItem } from 'react-native';
import icons from '../assets/fonts/custom-font-monochrome-inkscape.json';
import { IconClassic, type IconClassicName } from '../components/IconClassic';
import { NavigationDebugInfo } from '../components/NavigationDebugInfo';
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
  const sharedStyles = useMemo(
    () => getSharedStyles(iconSize, numColumns, colorful),
    [iconSize, numColumns, colorful]
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
