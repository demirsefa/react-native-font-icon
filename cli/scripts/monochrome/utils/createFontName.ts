import path from 'node:path';
import { DEFAULT_FONT_NAME } from '../constants.ts';
import { normalizeFontName } from './normalizeFontName.ts';

export function createFontName(
  fontName: string | undefined,
  assetsFolder: string
): string {
  const derived = path.basename(path.resolve(assetsFolder));
  return normalizeFontName(fontName, derived || DEFAULT_FONT_NAME);
}

