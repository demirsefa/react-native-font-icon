import fs from 'node:fs';

import type { GlyphMapping } from '../types.js';

export async function writeGlyphMetadata(params: {
  glyphMappings: GlyphMapping[];
  outputFolder: string;
  fontName: string;
}): Promise<string> {
  const { glyphMappings, outputFolder, fontName } = params;

  // Write a simple glyphmap (name -> codepoint) for app consumption.
  // Keep the existing filename "<fontName>-glyphmap.json" to avoid generating extra files.
  const glyphmap: Record<string, number> = {};
  for (const glyph of glyphMappings) {
    glyphmap[glyph.name] = glyph.codepoint;
  }

  const glyphmapPath = `${outputFolder}/${fontName}-glyphmap.json`;
  await fs.promises.mkdir(outputFolder, { recursive: true });

  await fs.promises.writeFile(
    glyphmapPath,
    JSON.stringify(glyphmap, null, 2),
    'utf8'
  );
  return glyphmapPath;
}
