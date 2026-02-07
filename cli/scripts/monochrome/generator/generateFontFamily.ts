import fs from 'node:fs';
import path from 'node:path';

import { START_CODEPOINT } from '../constants.ts';
import svgtofont from 'svgtofont';

export async function generateFontFamily(
  assetsFolder: string,
  outputFolder: string,
  fontName: string
): Promise<void> {
  const entries = await fs.promises.readdir(assetsFolder, {
    withFileTypes: true,
  });
  const iconNames = entries
    .filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.svg')
    )
    .map((entry) => path.parse(entry.name).name)
    .sort((a, b) => a.localeCompare(b));

  const seen = new Set<string>();
  for (const name of iconNames) {
    if (seen.has(name)) {
      throw new Error(`Duplicate icon name detected: ${name}`);
    }
    seen.add(name);
  }

  const codepoints: Record<string, number> = {};
  let current = START_CODEPOINT;
  for (const name of iconNames) {
    codepoints[name] = current++;
  }

  await svgtofont({
    src: assetsFolder,
    dist: outputFolder,
    fontName,
    startUnicode: START_CODEPOINT,
    // Generate TTF only (svgtofont defaults to multiple formats).
    excludeFormat: ['eot', 'woff', 'woff2', 'svg', 'symbol.svg'],
    css: false,
    outSVGReact: false,
    outSVGReactNative: false,
    getIconUnicode: (name: string) => {
      const codepoint = codepoints[name] as number;
      // Names come from `iconNames` so this should always exist.
      // svgtofont expects: [unicodeString, codepointNumber]
      return [String.fromCodePoint(codepoint), codepoint] as [string, number];
    },
  });

  const glyphMapPath = path.join(outputFolder, `${fontName}.json`);
  await fs.promises.writeFile(
    glyphMapPath,
    JSON.stringify(codepoints, null, 2),
    'utf8'
  );
}
