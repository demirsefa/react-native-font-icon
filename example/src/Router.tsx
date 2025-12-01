import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import Home from './screens/Home';
import Monochrome from './screens/Monochrome';
import ColorIcons from './screens/ColorIcons';
import MonochromeClassic from './screens/MonochromeClassic';

enableScreens();

export type RootStackParamList = {
  Home: undefined;
  Monochrome: undefined;
  ColorIcons: undefined;
  MonochromeOld: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Router() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ title: 'Font Icon' }}
      />
      <Stack.Screen
        name="Monochrome"
        component={Monochrome}
        options={{ title: 'Monochrome Icons' }}
      />
      <Stack.Screen
        name="ColorIcons"
        component={ColorIcons}
        options={{ title: 'Color Icons' }}
      />
      <Stack.Screen
        name="MonochromeOld"
        component={MonochromeClassic}
        options={{ title: 'Monochrome (SVG)' }}
      />
    </Stack.Navigator>
  );
}
