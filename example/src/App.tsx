import { IconProvider } from 'react-native-font-icon';
import Home from './screens/Home';
import { DebugProvider } from './contexts/DebugContext';
import monochromeInkscape from './assets/fonts/common/custom-font-monochrome-inkscape.json';
import monochrome from './assets/fonts/common/custom-font-monochrome.json';
import colorFamily from './assets/fonts/common/custom-font-colors-glyphmap.json';

const fontData = [
  {
    family: 'custom-font-monochrome-inkscape',
    glyphMap: monochromeInkscape,
  },
  {
    family: 'custom-font-monochrome',
    glyphMap: monochrome,
  },
  {
    family: 'custom-font-colors',
    glyphMap: colorFamily,
  },
];

export default function App() {
  return (
    <DebugProvider>
      <IconProvider fontData={fontData}>
        <Home />
      </IconProvider>
    </DebugProvider>
  );
}
