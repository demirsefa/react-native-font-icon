import path from 'node:path';
import { DEFAULT_FONT_NAME } from '../constants.js';

export function normalizeFontName(
  fontName: string | undefined,
  fallback = DEFAULT_FONT_NAME
): string {
  if (!fontName || !fontName.trim()) {
    return fallback;
  }

  const trimmed = fontName.trim();
  const parsed = path.parse(trimmed);
  return parsed.ext ? parsed.name : parsed.base;
}
