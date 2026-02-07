import fs from 'node:fs';

import type { GeneratedConfig } from '../types.ts';

export async function cleanup(
  configs: GeneratedConfig[],
  stagingDir: string
): Promise<void> {
  await Promise.all(
    configs.map((config) => fs.promises.rm(config.configPath, { force: true }))
  );
  await fs.promises.rm(stagingDir, { recursive: true, force: true });
}

