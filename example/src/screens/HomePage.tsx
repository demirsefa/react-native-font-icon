import { SafeAreaView, Text, StyleSheet } from 'react-native';

export default function HomePage() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Hello world</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
  },
});
