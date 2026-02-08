import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Payload, SelectionResult } from '../screens/Home';

type StepOption = {
  id: string;
  label: string;
  next?: string;
};

type StepConfig = {
  id: string;
  title: string;
  options: StepOption[];
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

  const findStep = (stepId: string) =>
    selectionTreeConfig.steps.find((step) => step.id === stepId);

  const buildFlow = (state: SelectionState) => {
    const steps: StepConfig[] = [];
    const firstStep = selectionTreeConfig.steps[0];
    if (!firstStep) {
      return steps;
    }
    let current: StepConfig | undefined = firstStep;
    while (current) {
      steps.push(current);
      const selectedId = state[current.id];
      if (!selectedId) {
        break;
      }
      const selectedOption = current.options.find(
        (option) => option.id === selectedId
      );
      const nextId = selectedOption?.next;
      if (!nextId || nextId === 'ready') {
        break;
      }
      const nextStep = findStep(nextId);
      if (!nextStep) {
        break;
      }
      current = nextStep;
    }
    return steps;
  };

  const handleOptionSelect = (stepId: string, optionId: string) => {
    setSelections((prev) => {
      const newSelections = { ...prev, [stepId]: optionId };
      const flow = buildFlow(newSelections);
      const allowed = new Set(flow.map((step) => step.id));
      Object.keys(newSelections).forEach((key) => {
        if (!allowed.has(key)) {
          delete newSelections[key];
        }
      });
      return newSelections;
    });
  };

  const visibleSteps = buildFlow(selections);

  const handleStart = () => {
    const type = selections.type as 'font' | 'svg';
    const count = selections.count ? parseInt(selections.count, 10) : NaN;
    if (type === 'font' && selections.fontFamily && Number.isFinite(count)) {
      const selection: SelectionResult<'font'> = {
        type: 'font',
        payload: {
          fontFamily: selections.fontFamily,
          count,
        },
      };
      onStart(selection);
      return;
    }
    if (type === 'svg' && selections.svgType && Number.isFinite(count)) {
      const selection: SelectionResult<'svg'> = {
        type: 'svg',
        payload: {
          svgType: selections.svgType as 'icons' | 'color-icons',
          count,
        },
      };
      onStart(selection);
    }
  };

  const canStart = () => {
    const flow = buildFlow(selections);
    const lastStep = flow[flow.length - 1];
    if (!lastStep) {
      return false;
    }
    const selectedId = selections[lastStep.id];
    if (!selectedId) {
      return false;
    }
    const selectedOption = lastStep.options.find(
      (option) => option.id === selectedId
    );
    return selectedOption?.next === 'ready';
  };

  return (
    <View style={styles.container}>
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
    padding: 14,
    justifyContent: 'center',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buttonColumn: {
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 7,
    minWidth: 96,
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: '#4CAF50',
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderRadius: 7,
    alignItems: 'center',
    marginTop: 12,
  },
  startButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
