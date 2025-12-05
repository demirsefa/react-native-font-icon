const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../src/components');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate a typed icon component from a folder of SVG files.
 *
 * This is used to create:
 * - IconClassic.tsx       -> monochrome icons (../assets/icons)
 * - ColorIconClassic.tsx  -> color icons      (../assets/color-icons)
 */
function generateIconComponent({
  svgDir,
  importPrefix,
  componentName,
  typeName,
  propsInterfaceName,
  outputFileName,
}) {
  if (!fs.existsSync(svgDir)) {
    console.warn(
      `Skipped generating ${outputFileName} because SVG directory does not exist: ${svgDir}`
    );
    return;
  }

  const svgFiles = fs
    .readdirSync(svgDir)
    .filter((file) => file.endsWith('.svg'))
    .sort();

  console.log(
    `Found ${svgFiles.length} SVG files for ${outputFileName} in ${svgDir}`
  );

  if (svgFiles.length === 0) {
    console.warn(
      `No SVG files found for ${outputFileName}. Skipping component generation.`
    );
    return;
  }

  // Generate component name from filename
  function toComponentName(filename) {
    const name = filename.replace('.svg', '');
    return name
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  const imports = [];
  const cases = [];

  svgFiles.forEach((svgFile) => {
    const iconComponentName = toComponentName(svgFile);
    const svgName = svgFile.replace('.svg', '');

    imports.push(
      `import ${iconComponentName}Icon from '${importPrefix}/${svgFile}';`
    );
    cases.push(
      `    case '${svgName}':\n      return <${iconComponentName}Icon {...props} />;`
    );
  });

  const componentContent = `import type { SvgProps } from 'react-native-svg';

${imports.join('\n')}

export type ${typeName} = ${svgFiles
    .map((f) => `'${f.replace('.svg', '')}'`)
    .join(' | ')};

export interface ${propsInterfaceName} extends SvgProps {
  name: ${typeName};
}

export function ${componentName}({ name, ...props }: ${propsInterfaceName}) {
  switch (name) {
${cases.join('\n')}
    default:
      return null;
  }
}
`;

  const outputPath = path.join(OUTPUT_DIR, outputFileName);
  fs.writeFileSync(outputPath, componentContent, 'utf8');

  console.log(
    `\nGenerated ${outputFileName} with ${svgFiles.length} icons at ${outputPath}`
  );
}

// Monochrome icon set (existing behavior)
generateIconComponent({
  svgDir: path.join(__dirname, '../src/assets/icons'),
  importPrefix: '../assets/icons',
  componentName: 'IconClassic',
  typeName: 'IconClassicName',
  propsInterfaceName: 'IconClassicProps',
  outputFileName: 'IconClassic.tsx',
});

// Color icon set used for color font comparison
generateIconComponent({
  svgDir: path.join(__dirname, '../src/assets/color-icons'),
  importPrefix: '../assets/color-icons',
  componentName: 'ColorIconClassic',
  typeName: 'ColorIconClassicName',
  propsInterfaceName: 'ColorIconClassicProps',
  outputFileName: 'ColorIconClassic.tsx',
});
