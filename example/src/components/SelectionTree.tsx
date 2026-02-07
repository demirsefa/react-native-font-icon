import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Payload, SelectionResult } from '../screens/Home';

type StepOption = {
  id: string;
  label: string;
  nextType?: 'start' | 'fontFamilyMode';
};

type StepConfig = {
  id: string;
  title: string;
  options: StepOption[];
  dependsOn?: {
    step: string;
    value: string;
  };
};

type SelectionTreeConfig = {
  steps: StepConfig[];
};

const selectionTreeConfig =
  require('../config/selection-tree.json') as SelectionTreeConfig;

interface SelectionTreeProps {
  onStart: (selection: SelectionResult<keyof Payload>) => void;
}

type StepId = string;
type SelectionState = Record<StepId, string | null>;

export default function SelectionTree({ onStart }: SelectionTreeProps) {
  const [selections, setSelections] = useState<SelectionState>({});

  const handleOptionSelect = (stepId: string, optionId: string) => {
    setSelections((prev) => {
      const newSelections = { ...prev, [stepId]: optionId };
      // Clear dependent selections when parent changes
      const step = selectionTreeConfig.steps.find((s) => s.id === stepId);
      if (step) {
        selectionTreeConfig.steps.forEach((s) => {
          if (s.dependsOn?.step === stepId) {
            delete newSelections[s.id];
          }
        });
      }
      return newSelections;
    });
  };

  const visibleSteps = selectionTreeConfig.steps.filter((step) => {
    if (!step.dependsOn) {
      return true;
    }
    if (step.dependsOn.value === '*') {
      return selections[step.dependsOn.step] != null;
    }
    return selections[step.dependsOn.step] === step.dependsOn.value;
  });

  const handleStart = () => {
    const type = selections.type as 'font' | 'svg';
    if (type === 'font' && selections.fontFamily && selections.fontFamilyMode) {
      onStart({
        type: 'font',
        payload: {
          fontFamily: selections.fontFamily,
          fontFamilyMode: selections.fontFamilyMode as 'raw' | 'fallback',
        },
      });
    } else if (type === 'svg' && selections.svgType) {
      onStart({
        type: 'svg',
        payload: {
          svgType: selections.svgType as 'icons' | 'color-icons',
        },
      });
    }
  };

  const canStart = () => {
    const type = selections.type;
    if (type === 'font') {
      return (
        selections.fontFamily !== null &&
        selections.fontFamily !== undefined &&
        selections.fontFamilyMode !== null &&
        selections.fontFamilyMode !== undefined
      );
    }
    if (type === 'svg') {
      return selections.svgType !== null && selections.svgType !== undefined;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selection Tree</Text>

      {visibleSteps.map((step) => (
        <View key={step.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{step.title}</Text>
          <View
            style={
              step.options.length > 2 ? styles.buttonColumn : styles.buttonRow
            }
          >
            {step.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.button,
                  selections[step.id] === option.id && styles.buttonSelected,
                ]}
                onPress={() => handleOptionSelect(step.id, option.id)}
              >
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Start Butonu */}
      <TouchableOpacity
        style={[styles.startButton, !canStart() && styles.startButtonDisabled]}
        onPress={handleStart}
        disabled={!canStart()}
      >
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  buttonColumn: {
    gap: 10,
  },
  button: {
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: '#4CAF50',
  },
  startButton: {
    padding: 20,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
