import fs from 'node:fs';
import path from 'node:path';

import type { GlyphMapping } from '../types.ts';

export async function writeGlyphMetadata(params: {
  glyphMappings: GlyphMapping[];
  outputFolder: string;
  fontName: string;
}): Promise<string> {
  const { glyphMappings, outputFolder, fontName } = params;

  const entries = glyphMappings.map((glyph) => {
    const hex = glyph.codepoint.toString(16).toUpperCase().padStart(4, '0');
    return {
      name: glyph.name,
      codepoint: glyph.codepoint,
      codepointHex: `0x${hex}`,
      unicode: `\\u${hex}`,
      originalSvg: path.relative(process.cwd(), glyph.originalPath),
      stagedSvg: glyph.stagedFile,
    };
  });

  const filePath = path.join(outputFolder, `${fontName}-glyphmap.json`);
  await fs.promises.mkdir(outputFolder, { recursive: true });
  await fs.promises.writeFile(
    filePath,
    JSON.stringify(entries, null, 2),
    'utf8'
  );
  return filePath;
}

