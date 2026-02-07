import { IconProvider } from 'react-native-font-icon';
import Home from './screens/Home';
import { DebugProvider } from './contexts/DebugContext';

const fontData: Record<string, Record<string, number>> = {};

export default function App() {
  return (
    <DebugProvider>
      <IconProvider fontData={fontData}>
        <Home />
      </IconProvider>
    </DebugProvider>
  );
}
