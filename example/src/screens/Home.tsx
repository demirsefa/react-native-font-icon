import { View, Text, StyleSheet, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Router';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native Font Icon</Text>
      <Text style={styles.subtitle}>Choose a demo screen:</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Monochrome Icons"
          onPress={() => navigation.navigate('Monochrome')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Color Icons"
          onPress={() => navigation.navigate('ColorIcons')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Monochrome SVG (legacy)"
          onPress={() => navigation.navigate('MonochromeOld')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
  buttonContainer: {
    marginTop: 12,
  },
});
