const fs = require('fs');
const path = require('path');
let svgtofontPromise = null;

const FONT_NAME = 'font-family';
const START_CODEPOINT = 0xf101;

async function getIconNames(assetsFolder) {
  const entries = await fs.promises.readdir(assetsFolder, {
    withFileTypes: true,
  });
  const names = entries
    .filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.svg')
    )
    .map((entry) => path.parse(entry.name).name)
    .sort((a, b) => a.localeCompare(b));

  const seen = new Set();
  for (const name of names) {
    if (seen.has(name)) {
      throw new Error(`Duplicate icon name detected: ${name}`);
    }
    seen.add(name);
  }

  return names;
}

async function getSvgtofont() {
  if (!svgtofontPromise) {
    svgtofontPromise = import('svgtofont').then((mod) => mod.default || mod);
  }
  return svgtofontPromise;
}

function buildCodepoints(iconNames) {
  const codepoints = {};
  let current = START_CODEPOINT;
  for (const name of iconNames) {
    codepoints[name] = current++;
  }
  return codepoints;
}

async function writeGlyphMap(outputFolder, codepoints) {
  const targetPath = path.join(outputFolder, `${FONT_NAME}.json`);
  await fs.promises.writeFile(
    targetPath,
    JSON.stringify(codepoints, null, 2),
    'utf8'
  );
}

async function generateFontFamily(assetsFolder, outputFolder) {
  const iconNames = await getIconNames(assetsFolder);
  const codepoints = buildCodepoints(iconNames);
  const svgtofont = await getSvgtofont();

  await svgtofont({
    src: assetsFolder,
    dist: outputFolder,
    fontName: FONT_NAME,
    startUnicode: START_CODEPOINT,
    types: ['ttf'],
    css: false,
    outSVGReact: false,
    outSVGReactNative: false,
    sort: true,
    getIconUnicode: (name) => {
      const codepoint = codepoints[name];
      return codepoint ? [String.fromCodePoint(codepoint)] : [];
    },
  });

  await writeGlyphMap(outputFolder, codepoints);
}

module.exports = {
  generateFontFamily,
};
