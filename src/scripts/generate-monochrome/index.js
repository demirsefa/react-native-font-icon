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
  const fontFilePath = path.join(outputFolder, 'font-family.json');

  // If the generated font file is missing, we must regenerate; skip hash/storage checks.
  const fontExists = fs.existsSync(fontFilePath);
  if (!fontExists) {
    console.log(
      '[generate] font-family.json missing, regeneration required.',
      fontFilePath
    );
    return true;
  }

  // storage.json might be missing on first run; allow regeneration instead of throwing.
  let storage;
  try {
    storage = await getStorage();
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      console.log('[generate] storage.json missing, regeneration required.');
      return true;
    }
    throw error;
  }

  const [fontFamilyHash, folderLastChangeDate] = await Promise.all([
    getFontFamilyHash(outputFolder),
    getFolderLastChangeDate(assetsFolder),
  ]);

  console.log('[generate] change check ->', {
    storedFolder: storage.folderLastChangeDate,
    storedHash: storage.fontFamilyHash,
    currentFolder: folderLastChangeDate,
    currentHash: fontFamilyHash,
  });

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
    console.error(`Assets folder does not exist: ${assetsFolder}`);
    return false;
  }

  let assetEntries;
  try {
    assetEntries = fs.readdirSync(assetsFolder, { withFileTypes: false });
  } catch (error) {
    console.error(`Error reading assets folder: ${error.message}`);
    return false;
  }

  const hasSvgFiles = assetEntries.some((entry) =>
    entry.toLowerCase().endsWith('.svg')
  );

  if (!hasSvgFiles) {
    console.error(`No SVG files found in assets folder: ${assetsFolder}`);
    console.error(
      `Found ${assetEntries.length} entries:`,
      assetEntries.slice(0, 10)
    );
    return false;
  }

  if (!fs.existsSync(outputFolder)) {
    console.error(`Output folder does not exist: ${outputFolder}`);
    return false;
  }

  return true;
}

async function runGenerate({
  assetsFolder,
  outputFolder,
  generator,
  force = false,
}) {
  if (typeof generator !== 'function') {
    throw new Error('A generator function must be provided.');
  }

  if (!fileExistsAndValidates(assetsFolder, outputFolder)) {
    throw new Error(
      'Invalid folders: ensure assets folder exists with SVG files and output folder exists.'
    );
  }

  const required = force
    ? true
    : await checkIfGenerationRequired(assetsFolder, outputFolder);
  console.log('[generate] required?', required, 'force:', force);

  if (!required) {
    console.log('[generate] No changes detected, skipping generation.');
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
