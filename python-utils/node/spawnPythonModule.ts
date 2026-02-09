import path from 'node:path';

import { spawnWithLogs } from './spawnWithLogs.js';

/**
 * Spawn: python -m <module> ...args
 *
 * Kept in python-utils because it is python-specific process logic.
 */
export async function spawnPythonModule(params: {
  pythonBinary: string;
  module: string;
  args: string[];
  cwd: string;
}): Promise<void> {
  const { pythonBinary, module, args, cwd } = params;

  const extraPathEntries = path.isAbsolute(pythonBinary)
    ? [path.dirname(pythonBinary)]
    : [];

  const mergedPath = [...extraPathEntries, process.env.PATH || '']
    .filter(Boolean)
    .join(path.delimiter);

  await spawnWithLogs(pythonBinary, ['-m', module, ...args], {
    cwd,
    env: {
      ...process.env,
      PATH: mergedPath,
    },
  });
}
