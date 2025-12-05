import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import Home from './screens/Home';
import HomePage from './screens/HomePage';
import ColorFonts from './screens/ColorFonts';
import ColorFontsClassic from './screens/ColorFontsClassic';
import Monochrome from './screens/Monochrome';
import MonochromeClassic from './screens/MonochromeClassic';

enableScreens();

export type RootStackParamList = {
  Home: undefined;
  HomePage: undefined;
  ColorFonts: { iconSize: number; numColumns: number; colorful?: boolean };
  Monochrome: { iconSize: number; numColumns: number; colorful?: boolean };
  MonochromeClassic: {
    iconSize: number;
    numColumns: number;
    colorful?: boolean;
  };
  ColorFontsClassic: {
    iconSize: number;
    numColumns: number;
    colorful?: boolean;
  };
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
        name="HomePage"
        component={HomePage}
        options={{ title: 'Home Page' }}
      />
      <Stack.Screen
        name="ColorFonts"
        component={ColorFonts}
        options={{ title: 'Color Fonts' }}
      />
      <Stack.Screen
        name="ColorFontsClassic"
        component={ColorFontsClassic}
        options={{ title: 'Color Fonts (SVG)' }}
      />
      <Stack.Screen
        name="Monochrome"
        component={Monochrome}
        options={{ title: 'Monochrome Icons' }}
      />
      <Stack.Screen
        name="MonochromeClassic"
        component={MonochromeClassic}
        options={{ title: 'Monochrome (SVG)' }}
      />
    </Stack.Navigator>
  );
}
