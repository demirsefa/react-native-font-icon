import fs from 'node:fs';
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
  // Running multiple configs in a single nanoemoji invocation can lead to
  // collisions in intermediate build artifacts when configs share the same
  // `family` (common when `--platform-subfolders` is enabled).
  //
  // Example failure:
  //   ninja: error: build.ninja:... multiple rules generate <family>.fea
  //
  // To keep the font family stable across platforms while avoiding collisions,
  // run nanoemoji once per config and start from a clean build folder each time.
  for (const config of configs) {
    await fs.promises.rm(path.join(configDir, 'build'), {
      recursive: true,
      force: true,
    });

    const configArg = path
      .relative(configDir, config.configPath)
      .replace(/\\/g, '/');

    await spawnPythonModule({
      pythonBinary,
      module: 'nanoemoji.nanoemoji',
      args: [configArg],
      cwd: configDir,
    });
  }
}
