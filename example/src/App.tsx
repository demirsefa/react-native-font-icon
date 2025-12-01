import { NavigationContainer } from '@react-navigation/native';
import { IconProvider } from 'react-native-font-icon';
import Router from './Router';
import fontFamily from './assets/fonts/font-family.json';

export default function App() {
  return (
    <IconProvider fontFamilyName="font-family" fontData={fontFamily}>
      <NavigationContainer>
        <Router />
      </NavigationContainer>
    </IconProvider>
  );
}
