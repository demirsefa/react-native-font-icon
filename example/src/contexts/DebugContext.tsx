import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform, Share } from 'react-native';
import type { Payload, SelectionResult } from '../screens/Home';

type BenchmarkRecord = {
  runId: number;
  type: 'font' | 'svg';
  platform: string;
  fontFamily?: string;
  svgType?: string;
  count: number;
  startedAtMs: number;
  endedAtMs: number;
  durationMs: number;
};

type DebugContextType = {
  started: boolean;
  records: BenchmarkRecord[];
  recordsCount: number;
  start: (selection: SelectionResult<keyof Payload>) => void;
  end: () => BenchmarkRecord | null;
  finish: () => void;
  getAllCsv: () => string;
  shareAllCsv: () => Promise<string>;
  clearAll: () => void;
};

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  const recordsRef = useRef<BenchmarkRecord[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const selectionRef = useRef<SelectionResult<keyof Payload> | null>(null);
  const runIdRef = useRef(1);
  const [started, setStarted] = useState(false);
  const [records, setRecords] = useState<BenchmarkRecord[]>([]);

  const getNowMs = () =>
    typeof performance !== 'undefined' ? performance.now() : Date.now();

  const toMeta = (selection: SelectionResult<keyof Payload>) => {
    if (selection.type === 'font') {
      const { fontFamily, count } = selection.payload as Payload['font'];
      return { platform: Platform.OS, fontFamily, count };
    }
    const { svgType, count } = selection.payload as Payload['svg'];
    return { platform: Platform.OS, svgType, count };
  };

  const buildCsv = (rows: BenchmarkRecord[]) => {
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header =
      'runId,type,platform,fontFamily,svgType,count,startedAtMs,endedAtMs,durationMs,durationSec';
    const lines = rows.map((row) => {
      const durationSec = row.durationMs / 1000;
      return [
        row.runId,
        row.type,
        escapeCsv(row.platform),
        escapeCsv(row.fontFamily ?? ''),
        escapeCsv(row.svgType ?? ''),
        row.count,
        row.startedAtMs.toFixed(3),
        row.endedAtMs.toFixed(3),
        row.durationMs.toFixed(3),
        durationSec.toFixed(3),
      ].join(',');
    });
    return [header, ...lines].join('\n');
  };

  const start = useCallback((selection: SelectionResult<keyof Payload>) => {
    startTimeRef.current = getNowMs();
    selectionRef.current = selection;
    setStarted(true);
  }, []);

  const end = useCallback((): BenchmarkRecord | null => {
    if (startTimeRef.current == null || selectionRef.current == null) {
      return null;
    }
    const startedAtMs = startTimeRef.current;
    const endedAtMs = getNowMs();
    const meta = toMeta(selectionRef.current);
    const record: BenchmarkRecord = {
      runId: runIdRef.current++,
      type: selectionRef.current.type,
      ...meta,
      startedAtMs,
      endedAtMs,
      durationMs: endedAtMs - startedAtMs,
    };
    startTimeRef.current = null;
    selectionRef.current = null;
    recordsRef.current = [...recordsRef.current, record];
    setRecords(recordsRef.current);
    return record;
  }, []);

  const finish = useCallback(() => {
    setStarted(false);
  }, []);

  const getAllCsv = useCallback(() => {
    return buildCsv(recordsRef.current);
  }, []);

  const shareAllCsv = useCallback(async () => {
    const csv = buildCsv(recordsRef.current);
    await Share.share({ message: csv, title: 'benchmark.csv' });
    return csv;
  }, []);

  const clearAll = useCallback(() => {
    recordsRef.current = [];
    setRecords([]);
  }, []);

  const value = useMemo(
    () => ({
      started,
      records,
      recordsCount: records.length,
      start,
      end,
      finish,
      getAllCsv,
      shareAllCsv,
      clearAll,
    }),
    [started, records, start, end, finish, getAllCsv, shareAllCsv, clearAll]
  );

  return (
    <DebugContext.Provider value={value}>{children}</DebugContext.Provider>
  );
}

export function useDebugContext(): DebugContextType {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebugContext must be used within a DebugProvider');
  }
  return context;
}
