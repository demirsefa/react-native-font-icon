import path from 'node:path';

import type { ColorsParams } from './types.ts';
import { generateColorFonts } from './generateColorFonts.ts';

/**
 * CLI entrypoint for `generate:colors`.
 */
export async function runColors(params: ColorsParams) {
  const src = params.src;
  const dest = params.dest;
  if (!src || !dest) {
    throw new Error('Both src and dest are required for generate:colors.');
  }

  const assetsFolder = path.isAbsolute(src)
    ? src
    : path.resolve(process.cwd(), src);
  const outputFolder = path.isAbsolute(dest)
    ? dest
    : path.resolve(process.cwd(), dest);

  return await generateColorFonts({
    assetsFolder,
    outputFolder,
    pythonBinary: params.python,
    fontName: params.fontName,
    max: params.max,
    sanitize: params.sanitize,
    platformSubfolders: params.platformSubfolders,
  });
}
