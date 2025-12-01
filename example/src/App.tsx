import { View, StyleSheet } from 'react-native';
import fontFamily from './assets/fonts/font-family.json';
import { IconProvider, Icon } from 'react-native-font-icon';

export default function App() {
  return (
    <IconProvider fontFamilyName="font-family" fontData={fontFamily}>
      <View style={styles.container}>
        <Icon name="angle-up" />
      </View>
    </IconProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
