const path = require('path');
const fs = require('fs');
const { getFontFamilyHash } = require('./hashUtils');

const STORAGE_PATH = path.join(__dirname, './storage.json');

async function getStorage() {
  try {
    const data = await fs.promises.readFile(STORAGE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(`storage.json is missing at ${STORAGE_PATH}.`);
    }
    throw error;
  }
}

function setStorage(storage) {
  return fs.promises.writeFile(
    STORAGE_PATH,
    JSON.stringify(storage, null, 2),
    'utf8'
  );
}

async function getFolderLastChangeDate(folderPath) {
  try {
    const stat = await fs.promises.stat(folderPath);
    return stat.mtime.toISOString();
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function checkIfGenerationRequired(assetsFolder, outputFolder) {
  const storage = await getStorage();
  const [fontFamilyHash, folderLastChangeDate] = await Promise.all([
    getFontFamilyHash(outputFolder),
    getFolderLastChangeDate(assetsFolder),
  ]);

  if (
    !storage.folderLastChangeDate ||
    !storage.fontFamilyHash ||
    !folderLastChangeDate ||
    !fontFamilyHash
  ) {
    return true;
  }

  return !(
    storage.folderLastChangeDate === folderLastChangeDate &&
    storage.fontFamilyHash === fontFamilyHash
  );
}

function fileExistsAndValidates(assetsFolder, outputFolder) {
  if (!fs.existsSync(assetsFolder)) {
    return false;
  }

  const assetEntries = fs.readdirSync(assetsFolder, { withFileTypes: false });
  const hasSvgFiles = assetEntries.some((entry) =>
    entry.toLowerCase().endsWith('.svg')
  );

  if (!hasSvgFiles) {
    return false;
  }

  if (!fs.existsSync(outputFolder)) {
    return false;
  }

  return true;
}

async function runGenerate({ assetsFolder, outputFolder, generator }) {
  if (typeof generator !== 'function') {
    throw new Error('A generator function must be provided.');
  }

  if (!fileExistsAndValidates(assetsFolder, outputFolder)) {
    throw new Error(
      'Invalid folders: ensure assets folder exists with SVG files and output folder exists.'
    );
  }

  const required = await checkIfGenerationRequired(assetsFolder, outputFolder);

  if (!required) {
    return { generated: false };
  }

  await generator(assetsFolder, outputFolder);
  const [fontFamilyHash, folderLastChangeDate] = await Promise.all([
    getFontFamilyHash(outputFolder),
    getFolderLastChangeDate(assetsFolder),
  ]);

  await setStorage({
    folderLastChangeDate,
    fontFamilyHash,
  });

  return { generated: true };
}

async function main(assetsFolder, outputFolder, generator) {
  let generatorFn = generator;
  if (!generatorFn) {
    ({ generateFontFamily: generatorFn } = require('./generateFontFamily'));
  }

  return runGenerate({
    assetsFolder,
    outputFolder,
    generator: generatorFn,
  });
}

module.exports = {
  runGenerate,
  main,
  fileExistsAndValidates,
};
