import fs from 'node:fs';
import path from 'node:path';

import type { FallbackParams } from './types.ts';
import { CliUserError } from '../../errors/CliUserError.ts';
import { collectSvgFiles } from '../colors/svg/collectSvgFiles.ts';
import { writeJsonFile } from '../../scripts-utils/json/writeJsonFile.ts';

const DEFAULT_SRC = 'example/src/assets/icons';

type FallbackIconEntry = {
  name: string;
  svgPath: string;
  reasons: string[];
};

function resolvePath(inputPath: string) {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);
}

function isStrokeContent(svgContent: string): boolean {
  if (/\bstroke\s*=\s*["'](?!none\b)/i.test(svgContent)) {
    return true;
  }
  if (/\bstroke-width\s*=\s*["'](?!0\b)/i.test(svgContent)) {
    return true;
  }
  return /\bstroke-line(cap|join)\s*=/i.test(svgContent);
}

function hasFontFamily(svgContent: string): boolean {
  if (/<text\b/i.test(svgContent)) {
    return true;
  }
  return /\bfont-family\s*=/i.test(svgContent);
}

function getFallbackReasons(svgContent: string): string[] {
  const reasons: string[] = [];
  if (isStrokeContent(svgContent)) {
    reasons.push('stroke');
  }
  if (hasFontFamily(svgContent)) {
    reasons.push('font-family');
  }
  return reasons;
}

function toPascalCase(input: string): string {
  const cleaned = input.replace(/[^a-zA-Z0-9]+/g, ' ');
  const words = cleaned.split(' ').filter(Boolean);
  const joined = words
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join('');
  if (!joined) {
    return 'Icon';
  }
  return /^[A-Za-z]/.test(joined) ? joined : `Icon${joined}`;
}

function toImportPath(fromFile: string, targetFile: string): string {
  const relativePath = path.relative(path.dirname(fromFile), targetFile);
  const normalized = relativePath.split(path.sep).join('/');
  return normalized.startsWith('.') ? normalized : `./${normalized}`;
}

function buildComponentSource(
  componentPath: string,
  entries: FallbackIconEntry[]
): string {
  const nameMap = new Map<string, FallbackIconEntry>();
  for (const entry of entries) {
    if (nameMap.has(entry.name)) {
      console.warn(
        `[generate:fallback] Duplicate icon name "${entry.name}" found at ${entry.svgPath}. Keeping first occurrence.`
      );
      continue;
    }
    nameMap.set(entry.name, entry);
  }

  const names = Array.from(nameMap.keys()).sort((a, b) => a.localeCompare(b));
  const importStatements: string[] = [];
  const mappingLines: string[] = [];

  let index = 0;
  const usedImportNames = new Set<string>();
  for (const name of names) {
    const entry = nameMap.get(name);
    if (!entry) {
      continue;
    }
    const baseName = toPascalCase(name);
    let importName = baseName;
    while (usedImportNames.has(importName)) {
      index += 1;
      importName = `${baseName}${index}`;
    }
    usedImportNames.add(importName);
    const importPath = toImportPath(componentPath, entry.svgPath);
    importStatements.push(`import ${importName} from '${importPath}';`);
    mappingLines.push(`  '${name}': ${importName},`);
  }

  const typeUnion =
    names.length > 0 ? names.map((name) => `'${name}'`).join(' | ') : 'never';

  return [
    "import React from 'react';",
    "import type { SvgProps } from 'react-native-svg';",
    ...importStatements,
    '',
    `export type FallBackIconName = ${typeUnion};`,
    'export type FallBackIconProps = SvgProps & { name: FallBackIconName };',
    '',
    'const iconMap: Record<FallBackIconName, React.FC<SvgProps>> = {',
    ...mappingLines,
    '};',
    '',
    'export default function FallBackIcon({ name, ...props }: FallBackIconProps) {',
    '  const Component = iconMap[name];',
    '  if (!Component) {',
    '    return null;',
    '  }',
    '  return <Component {...props} />;',
    '}',
    '',
  ].join('\n');
}

export async function runFallback(params: FallbackParams) {
  const src = params.src ?? DEFAULT_SRC;
  const destJson = params.destJson;
  const destComponent = params.destComponent;

  if (!destJson || !destComponent) {
    throw new CliUserError(
      'Both destJson and destComponent are required. Provide positional args or --dest-json/--dest-component.'
    );
  }

  const assetsFolder = resolvePath(src);
  const jsonPath = resolvePath(destJson);
  const componentPath = resolvePath(destComponent);

  const svgFiles = await collectSvgFiles(assetsFolder);
  if (svgFiles.length === 0) {
    throw new CliUserError(`No SVG files found under: ${assetsFolder}`);
  }

  const fallbackEntries: FallbackIconEntry[] = [];
  for (const svgPath of svgFiles) {
    const content = await fs.promises.readFile(svgPath, 'utf8');
    const reasons = getFallbackReasons(content);
    if (reasons.length === 0) {
      continue;
    }
    const parsed = path.parse(svgPath);
    fallbackEntries.push({
      name: parsed.name,
      svgPath,
      reasons,
    });
    console.warn(`[generate:fallback] ${parsed.base} -> ${reasons.join(', ')}`);
  }

  const fallbackNames = Array.from(
    new Set(fallbackEntries.map((entry) => entry.name))
  ).sort((a, b) => a.localeCompare(b));

  await fs.promises.mkdir(path.dirname(jsonPath), { recursive: true });
  await writeJsonFile(jsonPath, fallbackNames);

  await fs.promises.mkdir(path.dirname(componentPath), { recursive: true });
  const componentSource = buildComponentSource(componentPath, fallbackEntries);
  await fs.promises.writeFile(componentPath, componentSource, 'utf8');

  return { fallbackCount: fallbackNames.length };
}
