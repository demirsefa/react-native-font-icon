import path from 'node:path';

import type { GeneratedConfig } from '../types.ts';
import { spawnPythonModule } from '../../../../python-utils/node/spawnPythonModule.ts';

/**
 * Run nanoemoji using config TOML files.
 *
 * We run via `python -m nanoemoji.nanoemoji` to avoid depending on a separate
 * `nanoemoji` executable being present on PATH.
 */
export async function runNanoemoji(
  pythonBinary: string,
  configDir: string,
  configs: GeneratedConfig[]
): Promise<void> {
  const configArgs = configs.map((config) =>
    path.relative(configDir, config.configPath).replace(/\\/g, '/')
  );

  await spawnPythonModule({
    pythonBinary,
    module: 'nanoemoji.nanoemoji',
    args: configArgs,
    cwd: configDir,
  });
}

