import path from 'node:path';

import { DEFAULT_FONT_NAME } from '../constants.ts';
import { normalizeFontName } from '../utils/normalizeFontName.ts';
import { sha256FileUtf8IfExists } from '../../../scripts-utils/hash/sha256FileIfExists.ts';

export async function getFontFamilyHash(
  outputFolder: string,
  fontName: string | undefined = DEFAULT_FONT_NAME
): Promise<string | null> {
  const resolvedFontName = normalizeFontName(fontName, DEFAULT_FONT_NAME);
  const fontFamily = path.join(outputFolder, `${resolvedFontName}.json`);

  return await sha256FileUtf8IfExists(fontFamily);
}
