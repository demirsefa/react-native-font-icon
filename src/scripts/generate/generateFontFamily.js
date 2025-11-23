const { generateFonts, FontAssetType, OtherAssetType } = require('fantasticon');

function generateFontFamily(assetsFolder, outputFolder) {
  return generateFonts({
    inputDir: assetsFolder,
    outputDir: outputFolder,
    fontTypes: [FontAssetType.TTF],
    assetTypes: [OtherAssetType.JSON],
    name: 'font-family',
    prefix: 'icon',
    selector: '.icon',
  });
}

module.exports = {
  generateFontFamily,
};
