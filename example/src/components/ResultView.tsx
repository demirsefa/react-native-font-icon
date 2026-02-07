import { View, Text, StyleSheet } from 'react-native';
import type { Payload, SelectionResult } from '../screens/Home';

interface ResultViewProps {
  selection: SelectionResult<keyof Payload>;
}

export default function ResultView({ selection }: ResultViewProps) {
  console.log(selection);
  return (
    <View style={styles.container}>
      <Text>ResultView</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
