import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import {
  CONFIG_FOLDER_NAME,
  DEFAULT_FONT_NAME,
  STAGING_FOLDER_NAME,
} from './constants.js';
import { pathExists } from '../../scripts-utils/fs/pathExists.js';
import { resolvePythonBinary } from '../../../python-utils/node/resolvePythonBinary.js';
import { CliUserError } from '../../errors/CliUserError.js';
import { createLogger } from '../../scripts-utils/logger.js';
import { collectSvgFiles } from './svg/collectSvgFiles.js';
import { stageSvgFiles } from './svg/stageSvgFiles.js';
import { createConfigFiles } from './config/createConfigFiles.js';
import { runNanoemoji } from './runner/runNanoemoji.js';
import { writeGlyphMetadata } from './output/writeGlyphMetadata.js';
import { cleanup } from './output/cleanup.js';
import { getFolderMtimeIso } from '../../scripts-utils/fs/getFolderMtimeIso.js';
import { sha256FileUtf8IfExists } from '../../scripts-utils/hash/sha256FileIfExists.js';
import { setColorsStorage } from './storage/setStorage.js';

const execFileAsync = promisify(execFile);
const logger = createLogger('colors');

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
        logger.warn(
          [
            '`resvg` was not found on PATH, but was found via Python user install.',
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
        'Missing dependency: `resvg`',
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
  platformBasePath?: string;
}) {
  const {
    assetsFolder,
    outputFolder,
    pythonBinary,
    fontName = DEFAULT_FONT_NAME,
    max,
    platformBasePath,
  } = params;
  logger.info(
    `Output folder: ${outputFolder} (platformBasePath=${platformBasePath ?? 'n/a'})`
  );

  if (!(await pathExists(assetsFolder))) {
    throw new Error(`Assets folder does not exist: ${assetsFolder}`);
  }

  logger.step(`Collecting SVG files from: ${assetsFolder}`);
  const svgFilesAll = await collectSvgFiles(assetsFolder);
  if (svgFilesAll.length === 0) {
    throw new Error(`No SVG files found under ${assetsFolder}`);
  }
  const svgFiles =
    typeof max === 'number' ? svgFilesAll.slice(0, max) : svgFilesAll;
  logger.success(
    `Found ${svgFilesAll.length} SVG files (processing ${svgFiles.length}${typeof max === 'number' ? `, limited by --max ${max}` : ''})`
  );

  logger.step('Resolving Python binary...');
  const python = await resolvePythonBinary(pythonBinary);
  logger.success(`Using Python: ${python}`);
  logger.step('Checking resvg availability...');
  await assertResvgAvailable(python);
  logger.success('resvg is available');

  logger.step('Creating temporary work directory...');
  const workDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'rn-font-icon-colors-')
  );
  const configDir = path.join(workDir, CONFIG_FOLDER_NAME);
  await fs.promises.mkdir(configDir, { recursive: true });
  const stagingDir = path.join(configDir, STAGING_FOLDER_NAME);

  logger.step(
    `Staging ${svgFiles.length} SVG file${svgFiles.length !== 1 ? 's' : ''}...`
  );
  const { stagedRelativePaths, glyphMappings } = await stageSvgFiles(
    svgFiles,
    stagingDir,
    configDir
  );
  const skippedCount = svgFiles.length - stagedRelativePaths.length;
  if (skippedCount > 0) {
    logger.success(
      `Staged ${stagedRelativePaths.length} SVG file${stagedRelativePaths.length !== 1 ? 's' : ''} (${skippedCount} skipped)`
    );
  } else {
    logger.success(
      `Staged ${stagedRelativePaths.length} SVG file${stagedRelativePaths.length !== 1 ? 's' : ''}`
    );
  }

  logger.step('Creating config files...');
  const configs = await createConfigFiles({
    configDir,
    outputFolder,
    fontName,
    relativeSrcs: stagedRelativePaths,
    platformBasePath,
  });
  logger.success(`Created ${configs.length} config file(s)`);
  for (const config of configs) {
    logger.info(`Config ${config.label}: ${config.outputFile}`);
  }

  try {
    logger.step('Running nanoemoji to generate fonts...');
    await runNanoemoji(python, configDir, configs);
    logger.success('Font generation completed');

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

    logger.step('Writing glyph metadata...');
    const glyphMapPath = await writeGlyphMetadata({
      glyphMappings,
      outputFolder,
      fontName,
    });
    logger.success(`Glyph metadata written to: ${glyphMapPath}`);

    logger.step('Calculating hashes and updating storage...');
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
    logger.success('Storage updated');

    logger.success('Font generation successful!');
    return {
      generated: true,
      pythonBinary: python,
      glyphMapPath,
      outputs,
    };
  } finally {
    logger.step('Cleaning up temporary files...');
    await cleanup(configs, stagingDir);
    await fs.promises.rm(workDir, { recursive: true, force: true });
    logger.success('Cleanup completed');
  }
}
