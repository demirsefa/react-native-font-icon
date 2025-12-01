import { View, Text, StyleSheet } from 'react-native';

export default function ColorIcons() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Color Icons</Text>
      <Text style={styles.subtitle}>
        This screen is ready for future examples.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
