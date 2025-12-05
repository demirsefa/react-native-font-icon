#!/usr/bin/env node
const path = require('path');
const { Command } = require('commander');
const { runGenerate } = require('./generate-monochrome');
const { generateColorFonts } = require('./generate-colors');

const DEFAULT_ASSETS_FOLDER = path.join(__dirname, '../assets/icons');
const DEFAULT_OUTPUT_FOLDER = path.join(__dirname, '../assets/fonts');

function resolveFolderPath(argValue, fallback) {
  if (!argValue) {
    return fallback;
  }

  return path.isAbsolute(argValue)
    ? argValue
    : path.resolve(process.cwd(), argValue);
}

function parseFlagsFromArgv() {
  const args = process.argv.slice(2);
  const flags = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-a' || args[i] === '--assets') {
      flags.assets = args[i + 1];
      i++; // Skip next arg as it's the value
    } else if (args[i] === '-o' || args[i] === '--output') {
      flags.output = args[i + 1];
      i++; // Skip next arg as it's the value
    } else if (args[i] === '-f' || args[i] === '--force') {
      flags.force = true;
    }
  }

  return flags;
}

async function handleGenerateCommand(assetsArg, outputArg, options) {
  // Parse flags manually from argv as fallback (Commander.js bug with default commands)
  const manualFlags = parseFlagsFromArgv();

  // Prioritize flag options over positional arguments
  const assetsPath = manualFlags.assets || options.assets || assetsArg;
  const outputPath = manualFlags.output || options.output || outputArg;
  const force = manualFlags.force || options.force;

  // Debug: show resolved input paths
  console.log('generate(monochrome) resolved paths ->');
  console.log('  assetsPath:', assetsPath);
  console.log('  outputPath:', outputPath);

  const assetsFolder = resolveFolderPath(assetsPath, DEFAULT_ASSETS_FOLDER);

  const outputFolder = resolveFolderPath(outputPath, DEFAULT_OUTPUT_FOLDER);

  const {
    generateFontFamily,
  } = require('./generate-monochrome/generateFontFamily');

  await runGenerate({
    assetsFolder,
    outputFolder,
    generator: generateFontFamily,
    force: Boolean(force),
  });
}

async function handleGenerateColorCommand(assetsArg, outputArg, options) {
  // Parse flags manually from argv as fallback (Commander.js bug with default commands)
  const manualFlags = parseFlagsFromArgv();

  // Prioritize flag options over positional arguments
  const assetsPath = manualFlags.assets || options.assets || assetsArg;
  const outputPath = manualFlags.output || options.output || outputArg;

  // Debug: show resolved input paths
  console.log('generate(color) resolved paths ->');
  console.log('  assetsPath:', assetsPath);
  console.log('  outputPath:', outputPath);

  const assetsFolder = resolveFolderPath(assetsPath, DEFAULT_ASSETS_FOLDER);

  const outputFolder = resolveFolderPath(outputPath, DEFAULT_OUTPUT_FOLDER);

  await generateColorFonts({
    assetsFolder,
    outputFolder,
    colorFontsRepoPath: options.colorFonts,
    pythonBinary: options.python,
    fontName: options.fontName,
  });
}

function registerMonochromeCommand(command) {
  return command
    .argument(
      '[assetsFolder]',
      'Folder containing SVG icons',
      DEFAULT_ASSETS_FOLDER
    )
    .argument(
      '[outputFolder]',
      'Destination folder for generated fonts',
      DEFAULT_OUTPUT_FOLDER
    )
    .option('-a, --assets <path>', 'Explicit path to the icons folder')
    .option('-o, --output <path>', 'Explicit path to the fonts output folder')
    .option('-f, --force', 'Force regeneration even when unchanged')
    .action(async (assetsArg, outputArg, options) => {
      try {
        await handleGenerateCommand(assetsArg, outputArg, options);
      } catch (error) {
        console.error(error);
        process.exitCode = 1;
      }
    });
}

const program = new Command();

program
  .name('generate-font-icon')
  .description('Generate font assets from SVG icons.');

registerMonochromeCommand(program).description(
  'Generate monochrome font assets (default command).'
);

registerMonochromeCommand(
  program
    .command('monochrome', { isDefault: true })
    .description('Generate monochrome font assets.')
);

program
  .command('color')
  .alias('colors')
  .description('Generate color fonts (glyf_colr_1 for Android, sbix for iOS).')
  .argument(
    '[assetsFolder]',
    'Folder containing SVG icons',
    DEFAULT_ASSETS_FOLDER
  )
  .argument(
    '[outputFolder]',
    'Destination folder for generated fonts',
    DEFAULT_OUTPUT_FOLDER
  )
  .option('-a, --assets <path>', 'Explicit path to the icons folder')
  .option('-o, --output <path>', 'Explicit path to the fonts output folder')
  .option(
    '--color-fonts <path>',
    'Path to the cloned googlefonts/color-fonts repository'
  )
  .option(
    '--python <binary>',
    'Python binary to use (defaults to python3/python)'
  )
  .option(
    '--font-name <name>',
    'Custom font family name used during compilation',
    'color-family'
  )
  .action(async (assetsArg, outputArg, options) => {
    try {
      await handleGenerateColorCommand(assetsArg, outputArg, options);
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);

module.exports = {
  handleGenerateCommand,
  handleGenerateColorCommand,
};
