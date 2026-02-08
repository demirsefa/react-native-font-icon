import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'src/assets/icons');
const COLOR_ICONS_DIR = path.join(ROOT, 'src/assets/color-icons');
const OUT_DIR = path.join(ROOT, 'src/components');

const TEST_HEADER = '// generated file - do not edit (TEST ONLY)';

function toComponentName(fileBase: string) {
  return fileBase
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join('');
}

async function readSvgNames(dir: string) {
  const entries = await fs.readdir(dir);
  return entries
    .filter((file) => file.toLowerCase().endsWith('.svg'))
    .map((file) => file.replace(/\.svg$/i, ''))
    .sort((a, b) => a.localeCompare(b));
}

function buildFileContents(options: {
  svgDirRel: string;
  names: string[];
  keyPrefix: string;
  typeName: string;
  arrayName: string;
  componentName: string;
}) {
  const { svgDirRel, names, keyPrefix, typeName, arrayName, componentName } =
    options;

  const imports = names
    .map((base) => {
      const component = toComponentName(base);
      return `import ${component} from '${svgDirRel}/${base}.svg';`;
    })
    .join('\n');

  const union = names.map((base) => `  | '${keyPrefix}${base}'`).join('\n');

  const arrayEntries = names
    .map((base) => `  '${keyPrefix}${base}'`)
    .join(',\n');

  const mapEntries = names
    .map((base) => {
      const component = toComponentName(base);
      return `  '${keyPrefix}${base}': ${component},`;
    })
    .join('\n');

  return `${TEST_HEADER}
import React from 'react';
import type { SvgProps } from 'react-native-svg';
${imports}

export type ${typeName} =
${union};
export type ${typeName}Props = SvgProps & { name: ${typeName} };
export const ${arrayName}: ${typeName}[] = [
${arrayEntries}
];

const iconMap: Record<${typeName}, React.FC<SvgProps>> = {
${mapEntries}
};

export default function ${componentName}({ name, ...props }: ${typeName}Props) {
  const Component = iconMap[name];
  if (!Component) {
    return null;
  }
  return <Component {...props} />;
}
`;
}

async function run() {
  const [icons, colorIcons] = await Promise.all([
    readSvgNames(ICONS_DIR),
    readSvgNames(COLOR_ICONS_DIR),
  ]);

  const monoOut = buildFileContents({
    svgDirRel: '../assets/icons',
    names: icons,
    keyPrefix: 'TestMono:',
    typeName: 'TestMonoIconName',
    arrayName: 'testMonoIconNames',
    componentName: 'TestMonoIcon',
  });

  const colorOut = buildFileContents({
    svgDirRel: '../assets/color-icons',
    names: colorIcons,
    keyPrefix: 'TestColor:',
    typeName: 'TestColorIconName',
    arrayName: 'testColorIconNames',
    componentName: 'TestColorIcon',
  });

  await fs.mkdir(OUT_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(OUT_DIR, 'test-mono-icons.generated.tsx'), monoOut),
    fs.writeFile(
      path.join(OUT_DIR, 'test-color-icons.generated.tsx'),
      colorOut
    ),
  ]);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
