import { NavigationContainer } from '@react-navigation/native';
import { IconProvider } from 'react-native-font-icon';
import Router from './Router';
import fontFamily from './assets/fonts/font-family.json';
import colorFamily from './assets/fonts/color-family-glyphmap.json';
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

export default function App() {
  return (
    <DebugProvider>
      <IconProvider
        fontFamilyName={['font-family', 'color-family-ios']}
        fontData={{
          'font-family': fontFamily,
          'color-family-ios': colorGlyphMap,
        }}
      >
        <NavigationContainer>
          <Router />
        </NavigationContainer>
      </IconProvider>
    </DebugProvider>
  );
}
