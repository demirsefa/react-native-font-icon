#!/usr/bin/env node
const path = require('path');
const { Command } = require('commander');
const { runGenerate } = require('./generate');
const { generateFontFamily } = require('./generate/generateFontFamily');

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

async function handleGenerateCommand(assetsArg, outputArg, options) {
  const assetsFolder = resolveFolderPath(
    options.assets ?? assetsArg,
    DEFAULT_ASSETS_FOLDER
  );

  const outputFolder = resolveFolderPath(
    options.output ?? outputArg,
    DEFAULT_OUTPUT_FOLDER
  );

  await runGenerate({
    assetsFolder,
    outputFolder,
    generator: generateFontFamily,
  });
}

const program = new Command();

program
  .name('generate-font-icon')
  .description('Generate font assets from SVG icons.')
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
  .action(async (assetsArg, outputArg, options) => {
    try {
      await handleGenerateCommand(assetsArg, outputArg, options);
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);

module.exports = {
  handleGenerateCommand,
};
