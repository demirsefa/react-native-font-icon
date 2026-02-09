import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { START_CODEPOINT } from '../constants.js';
import svgtofont from 'svgtofont';

export async function generateFontFamily(
  assetsFolder: string,
  outputFolder: string,
  fontName: string,
  options?: { max?: number }
): Promise<void> {
  const entries = await fs.promises.readdir(assetsFolder, {
    withFileTypes: true,
  });
  const svgEntriesAll = entries
    .filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.svg')
    )
    .map((entry) => ({
      fileName: entry.name,
      iconName: path.parse(entry.name).name,
    }))
    .sort((a, b) => a.iconName.localeCompare(b.iconName));

  if (svgEntriesAll.length === 0) {
    throw new Error(`No SVG files found under ${assetsFolder}`);
  }

  const max = options?.max;
  const svgEntries =
    typeof max === 'number' ? svgEntriesAll.slice(0, max) : svgEntriesAll;

  if (svgEntries.length === 0) {
    throw new Error(
      `No SVG files selected (max=${String(max)}) under ${assetsFolder}`
    );
  }

  const iconNames = svgEntries.map((e) => e.iconName);

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

  // svgtofont reads all SVG files under `src`. If we only want to process a
  // subset (e.g. when `--max` is used for quick tests), we must ensure the
  // `src` folder contains only the selected SVGs, otherwise `getIconUnicode`
  // will be called for icons that are not in our `codepoints` map.
  let compilationSrc = assetsFolder;
  let workDir: string | undefined;
  try {
    if (typeof max === 'number' && max < svgEntriesAll.length) {
      workDir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), 'rn-font-icon-mono-max-')
      );
      await Promise.all(
        svgEntries.map((e) =>
          fs.promises.copyFile(
            path.join(assetsFolder, e.fileName),
            path.join(workDir as string, e.fileName)
          )
        )
      );
      compilationSrc = workDir;
    }

    await svgtofont({
      src: compilationSrc,
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
        // svgtofont expects: [unicodeString, codepointNumber]
        return [String.fromCodePoint(codepoint), codepoint] as [string, number];
      },
    });
  } finally {
    if (workDir) {
      await fs.promises.rm(workDir, { recursive: true, force: true });
    }
  }

  const glyphMapPath = path.join(outputFolder, `${fontName}.json`);
  await fs.promises.writeFile(
    glyphMapPath,
    JSON.stringify(codepoints, null, 2),
    'utf8'
  );
}
