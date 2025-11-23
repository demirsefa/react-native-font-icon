const { createHash } = require('crypto');
const path = require('path');
const fs = require('fs');

async function getFontFamilyHash(outputFolder) {
  const fontFamily = path.join(outputFolder, 'font-family.json');
  try {
    await fs.promises.access(fontFamily, fs.constants.F_OK);
  } catch {
    return null;
  }
  const content = await fs.promises.readFile(fontFamily, 'utf8');
  return createHash('sha256').update(content).digest('hex');
}

module.exports = {
  getFontFamilyHash,
};
