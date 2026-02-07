#!/usr/bin/env node
import { Command } from 'commander';
import { CliUserError } from './errors/CliUserError.ts';
import { runColors } from './scripts/colors/index.ts';
import { runMonochrome } from './scripts/monochrome/index.ts';

type ColorsOptions = {
  src?: string;
  dest?: string;
  python?: string;
  fontName?: string;
  sanitize?: boolean;
  platformSubfolders?: boolean;
};

type MonochromeOptions = {
  src?: string;
  dest?: string;
  fontName?: string;
  sanitize?: boolean;
  sanitizeEngine?: 'inkscape' | 'paper';
  inkscape?: string;
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
    .option('--sanitize', 'EXPERIMENTAL: Sanitize SVGs before compilation', false)
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
