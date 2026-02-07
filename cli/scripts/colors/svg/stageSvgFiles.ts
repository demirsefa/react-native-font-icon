import fs from 'node:fs';
import path from 'node:path';

import { PUA_END, PUA_START } from '../constants.ts';
import type { GlyphMapping } from '../types.ts';
import { normalizeSvgContent } from './normalizeSvgContent.ts';
import { shouldSkipSvg } from './shouldSkipSvg.ts';
import { sanitizeSvgWithDefaultAdapter } from '../sanitize/default-adapter.ts';

export type StageSvgOptions = {
  sanitize?: boolean;
  pythonBinary?: string;
};

export type StageSvgResult = {
  stagedRelativePaths: string[];
  glyphMappings: GlyphMapping[];
};

export async function stageSvgFiles(
  svgFiles: string[],
  stagingDir: string,
  configDir: string,
  options: StageSvgOptions = {}
): Promise<StageSvgResult> {
  await fs.promises.rm(stagingDir, { recursive: true, force: true });
  await fs.promises.mkdir(stagingDir, { recursive: true });

  const stagedRelativePaths: string[] = [];
  const glyphMappings: GlyphMapping[] = [];

  let processedCount = 0;

  for (const svgPath of svgFiles) {
    const parsed = path.parse(svgPath);
    let content = await fs.promises.readFile(svgPath, 'utf8');

    if (shouldSkipSvg(content)) {
      console.warn(
        `Skipping ${parsed.base} because it uses clipPath references unsupported gradients.`
      );
      continue;
    }

    if (options.sanitize) {
      content = await sanitizeSvgWithDefaultAdapter(content, {
        pythonBinary: options.pythonBinary,
      });
    }

    processedCount += 1;
    const currentCodepoint = PUA_START + processedCount - 1;
    if (currentCodepoint > PUA_END) {
      throw new Error(
        `Too many SVGs (${processedCount}). This tool currently supports up to ${
          PUA_END - PUA_START + 1
        } icons.`
      );
    }

    const codepointHex = currentCodepoint.toString(16);
    const fileName = `emoji_u${codepointHex}.svg`;
    const destPath = path.join(stagingDir, fileName);
    const normalized = normalizeSvgContent(content);
    await fs.promises.writeFile(destPath, normalized, 'utf8');
    const relativePath = path.relative(configDir, destPath);
    stagedRelativePaths.push(relativePath);
    glyphMappings.push({
      originalPath: svgPath,
      name: parsed.name,
      codepoint: currentCodepoint,
      stagedFile: relativePath,
    });
  }

  if (processedCount === 0) {
    throw new Error(
      'All SVG files were skipped due to unsupported clip paths or gradients.'
    );
  }

  return {
    stagedRelativePaths,
    glyphMappings,
  };
}
