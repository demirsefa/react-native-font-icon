import path from 'node:path';

import { DEFAULT_FONT_NAME } from '../constants.js';
import { normalizeFontName } from '../utils/normalizeFontName.js';
import { sha256FileUtf8IfExists } from '../../../scripts-utils/hash/sha256FileIfExists.js';

export async function getFontFamilyHash(
  outputFolder: string,
  fontName: string | undefined = DEFAULT_FONT_NAME
): Promise<string | null> {
  const resolvedFontName = normalizeFontName(fontName, DEFAULT_FONT_NAME);
  const fontFamily = path.join(outputFolder, `${resolvedFontName}.json`);

  return await sha256FileUtf8IfExists(fontFamily);
}
