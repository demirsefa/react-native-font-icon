#!/usr/bin/env node
import { Command } from 'commander';
import { CliUserError } from './errors/CliUserError.js';
import { runColors } from './scripts/colors/index.js';
import { runMonochrome } from './scripts/monochrome/index.js';

type ColorsOptions = {
  src?: string;
  dest?: string;
  python?: string;
  fontName?: string;
  max?: number;
  platformBasePath?: string;
};

type MonochromeOptions = {
  src?: string;
  dest?: string;
  fontName?: string;
  max?: number;
  sanitize?: boolean;
  sanitizeEngine?: 'inkscape';
  inkscape?: string;
  inkscapeOutline?: boolean;
};

async function main(argv: string[]) {
  const program = new Command();

  program
    .name('generate')
    .description('Font & icon asset generator CLI (WIP).')
    .showHelpAfterError()
    .showSuggestionAfterError();

  program
    .command('generate:colors')
    .description('Generate color fonts.')
    .argument('[src]', 'Folder containing SVG icons')
    .argument('[dest]', 'Destination folder for generated fonts')
    .option('-s, --src <path>', 'Folder containing SVG icons')
    .option('-d, --dest <path>', 'Destination folder for generated fonts')
    .option(
      '--python <binary>',
      'Python binary to use (defaults to python3/python)'
    )
    .option(
      '--font-name <name>',
      'Custom font family name used during compilation',
      'color-family'
    )
    .option(
      '--max <count>',
      'Limit number of icons processed (useful for quick tests)',
      (value) => {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new CliUserError(`Invalid --max value: ${value}`);
        }
        return parsed;
      }
    )
    .option(
      '--platform-base-path <path>',
      'Base folder for platform outputs (writes ios/android subfolders under this path)'
    )
    .action(
      async (
        src: string | undefined,
        dest: string | undefined,
        options: ColorsOptions
      ) => {
        await runColors({
          ...options,
          src: options.src ?? src,
          dest: options.dest ?? dest,
        });
      }
    );

  program
    .command('generate:monochrome')
    .alias('generate:font')
    .description('Generate monochrome font (TTF) from SVG icons.')
    .argument('[src]', 'Folder containing SVG icons')
    .argument('[dest]', 'Destination folder for generated font + glyphmap')
    .option('-s, --src <path>', 'Folder containing SVG icons')
    .option(
      '-d, --dest <path>',
      'Destination folder for generated font + glyphmap'
    )
    .option(
      '--font-name <name>',
      'Optional font family/file name (defaults to assets folder name)'
    )
    .option(
      '--max <count>',
      'Limit number of icons processed (useful for quick tests)',
      (value) => {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new CliUserError(`Invalid --max value: ${value}`);
        }
        return parsed;
      }
    )
    .option(
      '--sanitize',
      'EXPERIMENTAL: Sanitize SVGs before compilation',
      false
    )
    .option(
      '--sanitize-engine <engine>',
      'EXPERIMENTAL: Sanitize engine: "inkscape" (best fidelity)',
      'inkscape'
    )
    .option(
      '--inkscape <path>',
      'EXPERIMENTAL: Path to inkscape binary (overrides PATH/auto-detection)'
    )
    .option(
      '--inkscape-outline',
      'EXPERIMENTAL: Run a post-process outline pass after inkscape (off by default)',
      false
    )
    .action(
      async (
        src: string | undefined,
        dest: string | undefined,
        options: MonochromeOptions
      ) => {
        const resolvedSrc = options.src ?? src;
        const resolvedDest = options.dest ?? dest;
        if (!resolvedSrc || !resolvedDest) {
          throw new Error(
            'Both src and dest are required. Provide positional arguments or --src/--dest.'
          );
        }

        await runMonochrome({
          ...options,
          src: resolvedSrc,
          dest: resolvedDest,
        });
      }
    );

  await program.parseAsync(argv);
}

main(process.argv).catch((error) => {
  if (error instanceof CliUserError) {
    // Purposefully do not print a stack trace for user-facing errors.
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
