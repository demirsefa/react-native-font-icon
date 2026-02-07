import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Resolve a usable python binary.
 *
 * Order:
 * - explicitBinary (if provided)
 * - python3
 * - python
 */
export async function resolvePythonBinary(
  explicitBinary?: string
): Promise<string> {
  const candidates: string[] = [];
  if (explicitBinary) {
    const absolute = path.isAbsolute(explicitBinary)
      ? explicitBinary
      : path.resolve(process.cwd(), explicitBinary);
    candidates.push(absolute);
  }

  candidates.push('python3', 'python');

  for (const candidate of candidates) {
    try {
      await execFileAsync(candidate, ['--version']);
      return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error(
    'Python is required. Please install Python 3 and ensure it is available on your PATH.'
  );
}

