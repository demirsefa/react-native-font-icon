import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import Home from './screens/Home';
import HomePage from './screens/HomePage';
import ColorFonts from './screens/ColorFonts';
import ColorFontsClassic from './screens/ColorFontsClassic';
import Monochrome from './screens/Monochrome';
import MonochromeFixed from './screens/MonochromeFixed';
import MonochromeClassic from './screens/MonochromeClassic';
// @ts-ignore - resolver in lint misses this local screen file
import MonochromeFixedClassic from './screens/MonochromeFixedClassic';

enableScreens();

export type RootStackParamList = {
  Home: undefined;
  HomePage: undefined;
  ColorFonts: undefined;
  Monochrome: undefined;
  MonochromeFixed: undefined;
  MonochromeClassic: undefined;
  MonochromeFixedClassic: undefined;
  ColorFontsClassic: undefined;
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
        name="MonochromeFixed"
        component={MonochromeFixed}
        options={{ title: 'Monochrome Icons (Fixed SVG)' }}
      />
      <Stack.Screen
        name="MonochromeFixedClassic"
        component={MonochromeFixedClassic}
        options={{ title: 'Monochrome Icons (Fixed Font)' }}
      />
      <Stack.Screen
        name="MonochromeClassic"
        component={MonochromeClassic}
        options={{ title: 'Monochrome (SVG)' }}
      />
    </Stack.Navigator>
  );
}
