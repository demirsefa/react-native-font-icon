import path from 'node:path';
import { spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { resolvePythonBinary } from '../../../../python-utils/node/resolvePythonBinary.js';
import { pathExists } from '../../../scripts-utils/fs/pathExists.js';

const execFileAsync = promisify(execFile);

export type DefaultSanitizeOptions = {
  pythonBinary?: string;
};

async function resolvePythonUtilsPath(): Promise<string> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const repoRootFromFile = path.resolve(here, '../../../../');
  const candidates = [
    path.join(process.cwd(), 'python-utils'),
    path.join(repoRootFromFile, 'python-utils'),
  ];

  for (const candidate of candidates) {
    if (await pathExists(path.join(candidate, 'sanitize.py'))) {
      return candidate;
    }
  }

  throw new Error(
    'python-utils not found. Expected <repo>/python-utils/sanitize.py to exist.'
  );
}

async function assertPythonAvailable(pythonBinary: string) {
  await execFileAsync(pythonBinary, ['--version']);
}

/**
 * Default sanitize adapter.
 *
 * Policy: does NOT install dependencies. If sanitize.py fails due to missing
 * deps, it should print clear instructions to stderr.
 */
export async function sanitizeSvgWithDefaultAdapter(
  svgContent: string,
  options: DefaultSanitizeOptions = {}
): Promise<string> {
  const pythonBinary = await resolvePythonBinary(options.pythonBinary);
  await assertPythonAvailable(pythonBinary);

  const pythonUtilsPath = await resolvePythonUtilsPath();
  const scriptPath = path.join(pythonUtilsPath, 'sanitize.py');

  return await new Promise<string>((resolve, reject) => {
    const child = spawn(pythonBinary, [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      const hint =
        '\n\nIf this is a dependency issue, install:\n' +
        '  python -m pip install -r python-utils/requirements.txt\n' +
        '\nIf pip is externally-managed, use a venv:\n' +
        '  python -m venv .venv\n' +
        '  source .venv/bin/activate\n' +
        '  pip install -r python-utils/requirements.txt\n';

      reject(
        new Error(
          `sanitize.py failed (exit code ${code}).\n\n${stderr || '(no stderr)'}${hint}`
        )
      );
    });

    child.stdin.write(svgContent);
    child.stdin.end();
  });
}
