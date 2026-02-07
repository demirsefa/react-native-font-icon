import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { CliUserError } from '../../../errors/CliUserError.ts';
import { resolveInkscapeBinary } from './resolveInkscapeBinary.ts';

export type SanitizeEngine = 'inkscape' | 'paper';

import outlineStroke from 'svg-outline-stroke';

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

  await new Promise<void>((resolve, reject) => {
    const child = spawn(inkscape, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`inkscape exited with code ${code}`));
    });
  });
}

async function sanitizeWithPaper(svgContent: string): Promise<string> {
  // Best-effort, depends on `svg-outline-stroke` package API shape.
  // We keep this isolated and throw a user-facing error if it fails.
  try {
    const result = await outlineStroke(svgContent);
    if (typeof result !== 'string') {
      throw new Error('svg-outline-stroke did not return a string');
    }
    return result;
  } catch (error) {
    throw new CliUserError(
      [
        '⚠️ EXPERIMENTAL: monochrome sanitize (paper)',
        '',
        'The JS sanitize engine failed while running `svg-outline-stroke`.',
        '',
        `Details: ${error instanceof Error ? error.message : String(error)}`,
        '',
        'Tip: Use inkscape for best fidelity:',
        '  --sanitize --sanitize-engine inkscape',
      ].join('\n')
    );
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
}) {
  const { assetsFolder, stagingDir, sanitize, engine, inkscapeBinary } = params;

  await fs.promises.rm(stagingDir, { recursive: true, force: true });
  await fs.promises.mkdir(stagingDir, { recursive: true });

  const entries = await fs.promises.readdir(assetsFolder, {
    withFileTypes: true,
  });

  const svgFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.svg'))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

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

  console.warn(
    [
      '⚠️ EXPERIMENTAL: monochrome sanitize is enabled.',
      `Engine: ${engine}`,
    ].join(' ')
  );

  if (engine === 'inkscape') {
    const inkscape = await resolveInkscapeBinary(inkscapeBinary);
    for (let i = 0; i < svgFiles.length; i++) {
      const file = svgFiles[i];
      // Inkscape can be slow per file; emit progress so it doesn't look "stuck".
      console.warn(`[inkscape sanitize] (${i + 1}/${svgFiles.length}) ${file}`);
      const inputSvg = path.join(assetsFolder, file);
      const outputSvg = path.join(stagingDir, file);
      await runInkscapeSingle({ inkscape, inputSvg, outputSvg });
    }
    return;
  }

  // engine === 'paper'
  for (const file of svgFiles) {
    const inputSvg = path.join(assetsFolder, file);
    const outputSvg = path.join(stagingDir, file);
    const content = await fs.promises.readFile(inputSvg, 'utf8');
    const sanitized = await sanitizeWithPaper(content);
    await fs.promises.writeFile(outputSvg, sanitized, 'utf8');
  }
}
