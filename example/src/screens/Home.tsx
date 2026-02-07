import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Router';
import { useDebugContext } from '../contexts/DebugContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: Props) {
  const { startCounter } = useDebugContext();

  const handleNavigate = (
    screenName:
      | 'Monochrome'
      | 'MonochromeFixed'
      | 'MonochromeFixedClassic'
      | 'MonochromeClassic'
      | 'ColorFonts'
      | 'ColorFontsClassic'
  ) => {
    startCounter(`debugNavigationStarted-${screenName}`);
    navigation.navigate(screenName);
  };

  const tableRows = [
    {
      key: 'mono-font',
      monoColor: 'Mono',
      engine: 'Font',
      fixed: false,
      detail: '48px / 4 cols',
      action: () => handleNavigate('Monochrome'),
    },
    {
      key: 'mono-font-fixed',
      monoColor: 'Mono',
      engine: 'Font',
      fixed: true,
      detail: '48px / 4 cols',
      action: () => handleNavigate('MonochromeFixedClassic'),
    },
    {
      key: 'mono-svg',
      monoColor: 'Mono',
      engine: 'SVG',
      fixed: false,
      detail: '48px / 4 cols',
      action: () => handleNavigate('MonochromeClassic'),
    },
    {
      key: 'mono-svg-fixed',
      monoColor: 'Mono',
      engine: 'SVG',
      fixed: true,
      detail: '48px / 4 cols',
      action: () => handleNavigate('MonochromeFixed'),
    },
    {
      key: 'color-font',
      monoColor: 'Color',
      engine: 'Font',
      fixed: false,
      detail: '24px / 6 cols',
      action: () => handleNavigate('ColorFonts'),
    },
    {
      key: 'color-svg',
      monoColor: 'Color',
      engine: 'SVG',
      fixed: false,
      detail: '24px / 6 cols',
      action: () => handleNavigate('ColorFontsClassic'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>React Native Font Icon</Text>
      <Text style={styles.tableNote}>Use “Open” to view.</Text>
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.headerCell, styles.typeCell]}>
            Mono / Color
          </Text>
          <Text style={[styles.cell, styles.headerCell]}>SVG / Font</Text>
          <Text style={[styles.cell, styles.headerCell]}>Fixed</Text>
          <Text style={[styles.cell, styles.headerCell]}>Open</Text>
          <Text style={[styles.cell, styles.headerCell]}>Details</Text>
        </View>
        {tableRows.map((row, idx) => {
          const disabled = !row.action;
          return (
            <View
              key={row.key}
              style={[
                styles.row,
                idx % 2 === 1 ? styles.rowAlt : null,
                disabled ? styles.rowDisabled : null,
              ]}
            >
              <Text style={[styles.cell, styles.typeCell]}>
                {row.monoColor}
              </Text>
              <Text style={styles.cell}>{row.engine}</Text>
              <Text style={styles.cell}>{row.fixed ? 'Yes' : 'No'}</Text>
              <View style={[styles.cell, styles.actionCell]}>
                {row.action ? (
                  <Pressable
                    onPress={row.action}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed ? styles.actionButtonPressed : null,
                    ]}
                  >
                    <Text style={styles.actionButtonText}>Open</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.muted}>—</Text>
                )}
              </View>
              <Text style={[styles.cell, styles.detailCell]}>{row.detail}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  tableNote: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  table: {
    backgroundColor: '#fafafa',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerRow: {
    backgroundColor: '#f1f1f1',
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    flex: 1,
    fontSize: 12,
    color: '#222',
  },
  actionCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  detailCell: {
    textAlign: 'right',
  },
  muted: {
    color: '#999',
  },
  headerCell: {
    fontWeight: '700',
  },
  typeCell: {
    flex: 1.2,
  },
  rowAlt: {
    backgroundColor: '#fff',
  },
  rowPressed: {
    backgroundColor: '#f0f6ff',
  },
  rowDisabled: {
    opacity: 0.5,
  },
});
