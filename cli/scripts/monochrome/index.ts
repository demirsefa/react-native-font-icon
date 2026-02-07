import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

import type { MonochromeParams } from './types.ts';
import { generateFontFamily } from './generator/generateFontFamily.ts';
import { createFontName } from './utils/createFontName.ts';
import { getFolderMtimeIso } from '../../scripts-utils/fs/getFolderMtimeIso.ts';
import { getFontFamilyHash } from './storage/getFontFamilyHash.ts';
import { setStorage } from './storage/setStorage.ts';
import { stageMonochromeSvgs } from './sanitize/sanitizeMonochromeSvgs.ts';
import { CliUserError } from '../../errors/CliUserError.ts';

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
  if (engine !== 'inkscape' && engine !== 'paper') {
    throw new CliUserError(
      `Invalid --sanitize-engine value: ${String(
        params.sanitizeEngine
      )}. Expected "inkscape" or "paper".`
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
        max: maxIcons,
      });
      compilationSrc = stagingDir;
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
