import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Router';
import { useDebugContext } from '../contexts/DebugContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: Props) {
  const { startCounter } = useDebugContext();

  const handleNavigate = (
    screenName: 'Monochrome' | 'MonochromeClassic',
    iconSize: number,
    numColumns: number,
    colorful?: boolean
  ) => {
    startCounter(`debugNavigationStarted-${screenName}`);
    navigation.navigate(screenName, { iconSize, numColumns, colorful });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>React Native Font Icon</Text>

      <Text style={styles.sectionTitle}>Font Family</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="1x"
          onPress={() => handleNavigate('Monochrome', 16, 12)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="2x"
          onPress={() => handleNavigate('Monochrome', 32, 6)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="3x"
          onPress={() => handleNavigate('Monochrome', 48, 4)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="1x Colorful"
          onPress={() => handleNavigate('Monochrome', 16, 12, true)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="2x Colorful"
          onPress={() => handleNavigate('Monochrome', 32, 6, true)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="3x Colorful"
          onPress={() => handleNavigate('Monochrome', 48, 4, true)}
        />
      </View>

      <Text style={styles.sectionTitle}>react-native-svg</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="1x"
          onPress={() => handleNavigate('MonochromeClassic', 16, 12)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="2x"
          onPress={() => handleNavigate('MonochromeClassic', 32, 6)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="3x"
          onPress={() => handleNavigate('MonochromeClassic', 48, 4)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="1x Colorful"
          onPress={() => handleNavigate('MonochromeClassic', 16, 12, true)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="2x Colorful"
          onPress={() => handleNavigate('MonochromeClassic', 32, 6, true)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="3x Colorful"
          onPress={() => handleNavigate('MonochromeClassic', 48, 4, true)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 12,
  },
});
