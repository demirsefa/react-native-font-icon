import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import {
  CONFIG_FOLDER_NAME,
  DEFAULT_FONT_NAME,
  STAGING_FOLDER_NAME,
} from './constants.ts';
import { pathExists } from '../../scripts-utils/fs/pathExists.ts';
import { resolvePythonBinary } from '../../../python-utils/node/resolvePythonBinary.ts';
import { CliUserError } from '../../errors/CliUserError.ts';
import { collectSvgFiles } from './svg/collectSvgFiles.ts';
import { stageSvgFiles } from './svg/stageSvgFiles.ts';
import { createConfigFiles } from './config/createConfigFiles.ts';
import { runNanoemoji } from './runner/runNanoemoji.ts';
import { writeGlyphMetadata } from './output/writeGlyphMetadata.ts';
import { cleanup } from './output/cleanup.ts';
import { getFolderMtimeIso } from '../../scripts-utils/fs/getFolderMtimeIso.ts';
import { sha256FileUtf8IfExists } from '../../scripts-utils/hash/sha256FileIfExists.ts';
import { setColorsStorage } from './storage/setStorage.ts';

const execFileAsync = promisify(execFile);

async function assertResvgAvailable(python: string) {
  try {
    await execFileAsync('resvg', ['--version']);
    return;
  } catch {
    // If resvg was installed via pip with a user install, the binary is often
    // located in $(python -m site --user-base)/bin and may not be on PATH.
    // Try that location automatically so users don't need to manually export PATH.
    try {
      const { stdout } = (await execFileAsync(
        python,
        ['-m', 'site', '--user-base'],
        { encoding: 'utf8' } as any
      )) as any;
      const userBase = String(stdout ?? '').trim();
      if (userBase) {
        const userBin = path.join(userBase, 'bin');
        const resvgPath = path.join(userBin, 'resvg');
        await execFileAsync(resvgPath, ['--version']);
        process.env.PATH = `${userBin}${path.delimiter}${process.env.PATH ?? ''}`;
        console.warn(
          [
            '⚠️ `resvg` was not found on PATH, but was found via Python user install.',
            `Using: ${resvgPath}`,
            'Tip: to avoid this warning, add it to your shell PATH:',
            `  export PATH="${userBin}:$PATH"`,
          ].join('\n')
        );
        return;
      }
    } catch {
      // Fall through to user-facing error below.
    }

    throw new CliUserError(
      [
        '❌ Missing dependency: `resvg`',
        '',
        'Color font generation uses nanoemoji, which requires the `resvg` executable on your PATH.',
        'This dependency is required; font generation cannot continue without it.',
        '',
        'Fix options:',
        '- One-liner (run without changing your shell): `PATH="$(python3 -m site --user-base)/bin:$PATH" yarn run generate:colors:example`',
        '- One-liner (install + run): `python3 -m pip install resvg-cli && PATH="$(python3 -m site --user-base)/bin:$PATH" yarn run generate:colors:example`',
        '- Install via pip: `python3 -m pip install resvg-cli`',
        '- Or install all python deps used by this repo:',
        '  - If you are in the example app (common): `python3 -m pip install -r ../python-utils/requirements.txt`',
        '  - If this package is in node_modules (from your app root): `python3 -m pip install -r node_modules/react-native-font-icon/python-utils/requirements.txt`',
        '  - If you are in this repo root: `python3 -m pip install -r python-utils/requirements.txt`',
        '- Or via Homebrew: `brew install resvg`',
        '',
        'Then re-run the command.',
      ].join('\n')
    );
  }
}

export async function generateColorFonts(params: {
  assetsFolder: string;
  outputFolder: string;
  pythonBinary?: string;
  fontName?: string;
  max?: number;
  sanitize?: boolean;
  platformSubfolders?: boolean;
}) {
  const {
    assetsFolder,
    outputFolder,
    pythonBinary,
    fontName = DEFAULT_FONT_NAME,
    max,
    sanitize,
    platformSubfolders,
  } = params;

  if (!(await pathExists(assetsFolder))) {
    throw new Error(`Assets folder does not exist: ${assetsFolder}`);
  }

  const svgFilesAll = await collectSvgFiles(assetsFolder);
  if (svgFilesAll.length === 0) {
    throw new Error(`No SVG files found under ${assetsFolder}`);
  }
  const svgFiles =
    typeof max === 'number' ? svgFilesAll.slice(0, max) : svgFilesAll;

  const python = await resolvePythonBinary(pythonBinary);
  await assertResvgAvailable(python);
  const workDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'rn-font-icon-colors-')
  );
  const configDir = path.join(workDir, CONFIG_FOLDER_NAME);
  await fs.promises.mkdir(configDir, { recursive: true });
  const stagingDir = path.join(configDir, STAGING_FOLDER_NAME);
  const { stagedRelativePaths, glyphMappings } = await stageSvgFiles(
    svgFiles,
    stagingDir,
    configDir,
    { sanitize, pythonBinary: python }
  );
  const configs = await createConfigFiles({
    configDir,
    outputFolder,
    fontName,
    relativeSrcs: stagedRelativePaths,
    platformSubfolders,
  });

  try {
    await runNanoemoji(python, configDir, configs);

    // Verify outputs exist and shape the return payload similar to previous version.
    const outputs: Array<{ platform: 'android' | 'ios'; path: string }> = [];
    for (const config of configs) {
      if (!(await pathExists(config.outputFile))) {
        throw new Error(
          `Expected font was not generated: ${config.outputFile}. Check nanoemoji output above for details.`
        );
      }
      outputs.push({
        platform: config.label,
        path: config.outputFile,
      });
    }

    const glyphMapPath = await writeGlyphMetadata({
      glyphMappings,
      outputFolder,
      fontName,
    });

    const [glyphMapHash, folderLastChangeDate] = await Promise.all([
      sha256FileUtf8IfExists(glyphMapPath),
      getFolderMtimeIso(assetsFolder),
    ]);

    await setColorsStorage({
      folderLastChangeDate,
      glyphMapHash,
      fontName,
      outputs,
    });

    return {
      generated: true,
      pythonBinary: python,
      glyphMapPath,
      outputs,
    };
  } finally {
    await cleanup(configs, stagingDir);
    await fs.promises.rm(workDir, { recursive: true, force: true });
  }
}
