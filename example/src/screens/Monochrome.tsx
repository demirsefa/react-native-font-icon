import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Icon, useGetAllIcons } from 'react-native-font-icon';
/**
 * flowbite icons used in this screen.
 * @see https://flowbite.com/icons/
 * https://www.figma.com/community/file/1253280241668899805/flowbite-icons-750-free-svg-icons-in-figma
 */
export default function Monochrome() {
  const allIcons = useGetAllIcons();
  return (
    <ScrollView style={styles.container}>
      {allIcons.map((icon) => (
        <View key={icon} style={styles.iconContainer}>
          <Text>{icon}</Text>
          <Icon style={styles.icon} name={icon} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    padding: 16,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    fontSize: 48,
  },
});
