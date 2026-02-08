import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Icon, useGetAllIcons } from 'react-native-font-icon';
import type { Payload, SelectionResult } from '../screens/Home';
import { useDebugContext } from '../contexts/DebugContext';
import TestColorIcon, {
  type TestColorIconName,
  testColorIconNames,
} from './test-color-icons.generated';
import TestMonoIcon, {
  type TestMonoIconName,
  testMonoIconNames,
} from './test-mono-icons.generated';

interface ResultViewProps {
  selection: SelectionResult<keyof Payload>;
  onFinished: () => void;
}

export default function ResultView({ selection, onFinished }: ResultViewProps) {
  const { end, finish } = useDebugContext();
  const fontPayload =
    selection.type === 'font' ? (selection.payload as Payload['font']) : null;
  const fontFamily = fontPayload?.fontFamily ?? '';
  const count = selection.payload.count;
  const iconNames = useGetAllIcons(fontFamily);

  useEffect(() => {
    end();
  }, [end]);
  const handleFinish = () => {
    end();
    finish();
    onFinished();
  };

  if (selection.type === 'font') {
    const selectionLabel = fontFamily;
    return (
      <View style={styles.container}>
        <Text style={styles.selectionText}>
          {selectionLabel} • {count} • {Platform.OS}
        </Text>
        <Text style={styles.title}>Result</Text>
        <ScrollView
          style={styles.iconsScroll}
          contentContainerStyle={styles.iconsContainer}
        >
          {iconNames.slice(0, count).map((name) => (
            <Icon
              key={name}
              name={name}
              family={fontFamily}
              style={styles.icon}
            />
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { svgType } = selection.payload as Payload['svg'];
  const svgNames: (TestMonoIconName | TestColorIconName)[] =
    svgType === 'icons' ? testMonoIconNames : testColorIconNames;
  return (
    <View style={styles.container}>
      <Text style={styles.selectionText}>
        {svgType} • {count} • {Platform.OS}
      </Text>
      <Text style={styles.title}>Result</Text>
      <ScrollView
        style={styles.iconsScroll}
        contentContainerStyle={styles.iconsContainer}
      >
        {svgNames
          .slice(0, count)
          .map((name) =>
            svgType === 'icons' ? (
              <TestMonoIcon
                key={name}
                name={name as TestMonoIconName}
                width={24}
                height={24}
              />
            ) : (
              <TestColorIcon
                key={name}
                name={name as TestColorIconName}
                width={24}
                height={24}
              />
            )
          )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  iconsScroll: {
    alignSelf: 'stretch',
    flex: 1,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  icon: {
    fontSize: 24,
  },
  selectionText: {
    color: '#666666',
    fontSize: 14,
  },
  finishButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#1e88e5',
  },
  footer: {
    alignSelf: 'stretch',
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
