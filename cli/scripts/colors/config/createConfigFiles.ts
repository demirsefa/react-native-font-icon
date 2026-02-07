import fs from 'node:fs';
import path from 'node:path';

import { COLOR_TARGETS } from '../constants.ts';
import type { GeneratedConfig } from '../types.ts';
import { buildConfigContent } from './buildConfigContent.ts';

export async function createConfigFiles(params: {
  configDir: string;
  outputFolder: string;
  fontName: string;
  relativeSrcs: string[];
  platformSubfolders?: boolean;
}): Promise<GeneratedConfig[]> {
  const {
    configDir,
    outputFolder,
    fontName,
    relativeSrcs,
    platformSubfolders,
  } = params;
  const configs: GeneratedConfig[] = [];

  for (const target of COLOR_TARGETS) {
    const fileName = `${fontName}-${target.label}.toml`;
    const configPath = path.join(configDir, fileName);
    const outputFile = platformSubfolders
      ? path.join(outputFolder, target.label, `${fontName}${target.extension}`)
      : path.join(
          outputFolder,
          `${fontName}-${target.label}${target.extension}`
        );
    await fs.promises.mkdir(path.dirname(outputFile), { recursive: true });
    const content = buildConfigContent({
      // When outputs are separated per platform folder, keep the family stable
      // so app code can refer to a single name.
      family: platformSubfolders ? fontName : `${fontName}-${target.label}`,
      outputFile,
      colorFormat: target.format,
      relativeSrcs,
    });
    await fs.promises.writeFile(configPath, content, 'utf8');
    configs.push({
      configPath,
      outputFile,
      label: target.label,
      extension: target.extension,
    });
  }

  return configs;
}
