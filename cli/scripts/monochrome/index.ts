import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

import type { MonochromeParams } from './types.js';
import { generateFontFamily } from './generator/generateFontFamily.js';
import { createFontName } from './utils/createFontName.js';
import { getFolderMtimeIso } from '../../scripts-utils/fs/getFolderMtimeIso.js';
import { getFontFamilyHash } from './storage/getFontFamilyHash.js';
import { setStorage } from './storage/setStorage.js';
import { stageMonochromeSvgs } from './sanitize/sanitizeMonochromeSvgs.js';
import { CliUserError } from '../../errors/CliUserError.js';

async function listSvgPaths(assetsFolder: string, max?: number) {
  const entries = await fs.promises.readdir(assetsFolder, {
    withFileTypes: true,
  });
  const svgFilesAll = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.svg'))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));
  const svgFiles =
    typeof max === 'number' ? svgFilesAll.slice(0, max) : svgFilesAll;
  if (svgFiles.length === 0) {
    throw new CliUserError(`No SVG files found under: ${assetsFolder}`);
  }
  return svgFiles.map((file) => path.join(assetsFolder, file));
}

export async function runMonochrome(params: MonochromeParams) {
  // src/dest are validated at CLI command layer (cli/index.ts)
  const assetsFolder = path.isAbsolute(params.src)
    ? params.src
    : path.resolve(process.cwd(), params.src);
  const outputFolder = path.isAbsolute(params.dest)
    ? params.dest
    : path.resolve(process.cwd(), params.dest);

  const fontName = createFontName(params.fontName, assetsFolder);
  const maxIcons = params.max;

  const sanitize = Boolean(params.sanitize);
  const engine = params.sanitizeEngine ?? 'inkscape';
  if (engine !== 'inkscape') {
    throw new CliUserError(
      `Invalid --sanitize-engine value: ${String(
        params.sanitizeEngine
      )}. Expected "inkscape".`
    );
  }

  // When sanitizing we stage SVGs in a temp directory to avoid mutating sources.
  let compilationSrc = assetsFolder;
  let workDir: string | undefined;
  try {
    if (sanitize) {
      workDir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), 'rn-font-icon-mono-')
      );
      const stagingDir = path.join(workDir, 'staging');
      await stageMonochromeSvgs({
        assetsFolder,
        stagingDir,
        sanitize: true,
        engine,
        inkscapeBinary: params.inkscape,
        inkscapeOutline: params.inkscapeOutline,
        max: maxIcons,
      });
      compilationSrc = stagingDir;
    } else {
      await listSvgPaths(assetsFolder, maxIcons);
    }

    await generateFontFamily(compilationSrc, outputFolder, fontName, {
      max: maxIcons,
    });
  } finally {
    if (workDir) {
      await fs.promises.rm(workDir, { recursive: true, force: true });
    }
  }

  const [fontFamilyHash, folderLastChangeDate] = await Promise.all([
    getFontFamilyHash(outputFolder, fontName),
    getFolderMtimeIso(assetsFolder),
  ]);

  await setStorage({
    folderLastChangeDate,
    fontFamilyHash,
    fontName,
  });

  return { generated: true, fontName };
}
