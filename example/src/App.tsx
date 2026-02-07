import { NavigationContainer } from '@react-navigation/native';
import { IconProvider } from 'react-native-font-icon';
import Router from './Router';
import monochromeFamily from './assets/fonts/custom-font-monochrome-inkscape.json';
import colorFamily from './assets/fonts/custom-font-colors-glyphmap.json';
import { DebugProvider } from './contexts/DebugContext';

type ColorGlyph = {
  name: string;
  codepoint: number;
};

const colorGlyphMap = (colorFamily as ColorGlyph[]).reduce<
  Record<string, number>
>((acc, glyph) => {
  acc[glyph.name] = glyph.codepoint;
  return acc;
}, {});

const fontData = {
  'custom-font-monochrome-inkscape': monochromeFamily,
  'custom-font-colors': colorGlyphMap,
} as const;

export default function App() {
  return (
    <DebugProvider>
      <IconProvider fontData={fontData}>
        <NavigationContainer>
          <Router />
        </NavigationContainer>
      </IconProvider>
    </DebugProvider>
  );
}
