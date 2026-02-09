import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { CliUserError } from '../../../errors/CliUserError.js';
import { resolveInkscapeBinary } from './resolveInkscapeBinary.js';
import { createLogger } from '../../../scripts-utils/logger.js';

export type SanitizeEngine = 'inkscape';

import outlineStroke from 'svg-outline-stroke';

const logger = createLogger('monochrome:sanitize');

async function runInkscapeSingle(params: {
  inkscape: string;
  inputSvg: string;
  outputSvg: string;
}) {
  const { inkscape, inputSvg, outputSvg } = params;

  // Inkscape v1.x CLI. This is experimental: CLI flags can differ by version.
  const args = [
    inputSvg,
    '--export-type=svg',
    '--export-plain-svg',
    `--export-filename=${outputSvg}`,
    '--actions=select-all:all;object-stroke-to-path;object-to-path;export-do',
  ];

  logger.info(
    `Inkscape command: ${inkscape} ${args.map((arg) => JSON.stringify(arg)).join(' ')}`
  );
  await new Promise<void>((resolve, reject) => {
    const child = spawn(inkscape, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`inkscape exited with code ${code}`));
    });
  });
}

function hasVisibleStroke(svgContent: string): boolean {
  return /stroke\s*[:=]\s*["']?(?!none\b)[^"']+/i.test(svgContent);
}

async function tryOutlineStroke(
  svgContent: string,
  name: string
): Promise<string | null> {
  try {
    const result = await outlineStroke(svgContent);
    if (typeof result !== 'string') {
      throw new Error('svg-outline-stroke did not return a string');
    }
    return result;
  } catch (error) {
    logger.warn(
      `Outline-stroke failed for ${name}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return null;
  }
}

/**
 * Stage SVG files into `stagingDir`, optionally sanitizing them.
 *
 * - Preserves filenames (so glyph names stay stable for svgtofont).
 * - EXPERIMENTAL feature.
 */
export async function stageMonochromeSvgs(params: {
  assetsFolder: string;
  stagingDir: string;
  sanitize: boolean;
  engine: SanitizeEngine;
  inkscapeBinary?: string;
  inkscapeOutline?: boolean;
  max?: number;
}): Promise<void> {
  const {
    assetsFolder,
    stagingDir,
    sanitize,
    engine,
    inkscapeBinary,
    inkscapeOutline = false,
    max,
  } = params;

  await fs.promises.rm(stagingDir, { recursive: true, force: true });
  await fs.promises.mkdir(stagingDir, { recursive: true });

  const entries = await fs.promises.readdir(assetsFolder, {
    withFileTypes: true,
  });

  const svgFilesAll = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.svg'))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  if (svgFilesAll.length === 0) {
    throw new CliUserError(`No SVG files found under: ${assetsFolder}`);
  }

  const svgFiles =
    typeof max === 'number' ? svgFilesAll.slice(0, max) : svgFilesAll;

  if (svgFiles.length === 0) {
    throw new CliUserError(
      `No SVG files selected (max=${String(max)}) under: ${assetsFolder}`
    );
  }

  if (!sanitize) {
    // Simple copy.
    await Promise.all(
      svgFiles.map((file) =>
        fs.promises.copyFile(
          path.join(assetsFolder, file),
          path.join(stagingDir, file)
        )
      )
    );
    return;
  }

  logger.warn(
    [
      'EXPERIMENTAL: monochrome sanitize is enabled.',
      `Engine: ${engine}`,
      typeof max === 'number' ? `Max: ${max}` : '',
    ].join(' ')
  );

  let processedCount = 0;

  if (engine === 'inkscape') {
    const inkscape = await resolveInkscapeBinary(inkscapeBinary);
    logger.info(`Resolved Inkscape binary: ${inkscape}`);
    if (inkscapeOutline) {
      logger.info('Inkscape post-process outline is enabled.');
    }
    let outlineAppliedCount = 0;
    let outlineAttemptedCount = 0;
    for (const [i, file] of svgFiles.entries()) {
      // Inkscape can be slow per file; emit progress so it doesn't look "stuck".
      logger.progressStep(i + 1, svgFiles.length, file);
      const inputSvg = path.join(assetsFolder, file);
      const outputSvg = path.join(stagingDir, file);
      try {
        await runInkscapeSingle({ inkscape, inputSvg, outputSvg });
        if (inkscapeOutline) {
          try {
            const exported = await fs.promises.readFile(outputSvg, 'utf8');
            if (hasVisibleStroke(exported)) {
              outlineAttemptedCount += 1;
              const outlined = await tryOutlineStroke(exported, file);
              if (outlined) {
                await fs.promises.writeFile(outputSvg, outlined, 'utf8');
                outlineAppliedCount += 1;
              }
            }
          } catch (error) {
            logger.warn(
              `Post-sanitize check failed for ${file}: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        }
        processedCount += 1;
      } catch (error) {
        logger.warn(
          `sanitize-failed: ${file} (${error instanceof Error ? error.message : String(error)})`
        );
      }
    }
    if (inkscapeOutline) {
      logger.info(
        `Inkscape outline summary: ${outlineAppliedCount}/${outlineAttemptedCount} applied.`
      );
    }
    if (processedCount === 0) {
      throw new CliUserError(
        'All SVG files failed during sanitize (inkscape).'
      );
    }
    return;
  }

  // This should never happen as engine is validated to be 'inkscape' only
  throw new CliUserError(`Unsupported sanitize engine: ${engine}`);
}
