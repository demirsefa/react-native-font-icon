#!/usr/bin/env node
import { Command } from 'commander';
import { CliUserError } from './errors/CliUserError.ts';
import { runColors } from './scripts/colors/index.ts';
import { runMonochrome } from './scripts/monochrome/index.ts';
import { runFallback } from './scripts/fallback/index.ts';

type ColorsOptions = {
  src?: string;
  dest?: string;
  python?: string;
  fontName?: string;
  max?: number;
  sanitize?: boolean;
  platformSubfolders?: boolean;
};

type MonochromeOptions = {
  src?: string;
  dest?: string;
  fontName?: string;
  max?: number;
  sanitize?: boolean;
  sanitizeEngine?: 'inkscape' | 'paper';
  inkscape?: string;
};

type FallbackOptions = {
  src?: string;
  destJson?: string;
  destComponent?: string;
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
    .option('--sanitize', 'Sanitize SVGs before compilation', false)
    .option(
      '--platform-subfolders',
      'Write platform outputs into ios/android subfolders under dest',
      false
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
      'EXPERIMENTAL: Sanitize engine: "inkscape" (best fidelity) or "paper" (best-effort JS)',
      'inkscape'
    )
    .option(
      '--inkscape <path>',
      'EXPERIMENTAL: Path to inkscape binary (overrides PATH/auto-detection)'
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

  program
    .command('generate:fallback')
    .description('Generate fallback icon list + component from SVGs.')
    .argument('[src]', 'Folder containing SVG icons')
    .argument('[destJson]', 'Destination JSON file for fallback icon names')
    .argument(
      '[destComponent]',
      'Destination TSX file for FallBackIcon component'
    )
    .option('-s, --src <path>', 'Folder containing SVG icons')
    .option(
      '--dest-json <path>',
      'Destination JSON file for fallback icon names'
    )
    .option(
      '--dest-component <path>',
      'Destination TSX file for FallBackIcon component'
    )
    .action(
      async (
        src: string | undefined,
        destJson: string | undefined,
        destComponent: string | undefined,
        options: FallbackOptions
      ) => {
        const resolvedJson = options.destJson ?? destJson;
        const resolvedComponent = options.destComponent ?? destComponent;
        if (!resolvedJson || !resolvedComponent) {
          throw new Error(
            'Both destJson and destComponent are required. Provide positional arguments or --dest-json/--dest-component.'
          );
        }
        await runFallback({
          src: options.src ?? src,
          destJson: resolvedJson,
          destComponent: resolvedComponent,
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
