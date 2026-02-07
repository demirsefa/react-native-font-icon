import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { CliUserError } from '../../../errors/CliUserError.ts';

const execFileAsync = promisify(execFile);

async function canRun(binary: string): Promise<boolean> {
  try {
    await execFileAsync(binary, ['--version']);
    return true;
  } catch {
    return false;
  }
}

async function isExecutableFile(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function maybeResolveRelative(p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

export async function resolveInkscapeBinary(
  explicit?: string
): Promise<string> {
  const candidates: string[] = [];

  if (explicit) {
    const resolved = maybeResolveRelative(explicit);
    candidates.push(resolved);
  }

  const env = process.env.INKSCAPE_PATH;
  if (env) {
    candidates.push(maybeResolveRelative(env));
  }

  // PATH candidate
  candidates.push('inkscape');

  // OS-specific common locations
  if (process.platform === 'darwin') {
    candidates.push('/Applications/Inkscape.app/Contents/MacOS/inkscape');
  } else if (process.platform === 'win32') {
    const programFiles = [
      process.env['ProgramFiles'],
      process.env['ProgramFiles(x86)'],
      // Fallback defaults
      'C:\\\\Program Files',
      'C:\\\\Program Files (x86)',
    ].filter(Boolean) as string[];

    for (const base of programFiles) {
      candidates.push(path.join(base, 'Inkscape', 'bin', 'inkscape.com'));
      candidates.push(path.join(base, 'Inkscape', 'bin', 'inkscape.exe'));
    }
  } else {
    // Linux (and others) typically rely on PATH.
    // No extra defaults here.
  }

  for (const candidate of candidates) {
    if (path.isAbsolute(candidate)) {
      if (!(await isExecutableFile(candidate))) continue;
    }
    if (await canRun(candidate)) {
      return candidate;
    }
  }

  const platformHint =
    process.platform === 'darwin'
      ? '- macOS: `brew install --cask inkscape` (or install the .app)'
      : process.platform === 'win32'
        ? '- Windows: `winget install Inkscape.Inkscape`'
        : '- Linux: `sudo apt-get install inkscape` (or your distro equivalent)';

  throw new CliUserError(
    [
      '⚠️ EXPERIMENTAL: monochrome sanitize (inkscape)',
      '',
      '`--sanitize-engine inkscape` requires the Inkscape CLI binary (`inkscape`) to be installed.',
      '',
      'Fix options:',
      platformHint,
      '- Or provide a binary explicitly: `--inkscape /path/to/inkscape`',
      '- Or set env: `INKSCAPE_PATH=/path/to/inkscape`',
      '',
      `Your platform: ${process.platform} ${os.release()}`,
    ].join('\n')
  );
}
