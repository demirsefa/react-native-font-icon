const fs = require('fs');
const path = require('path');

const SVG_DIR = path.join(__dirname, '../src/assets/icons');
const OUTPUT_DIR = path.join(__dirname, '../src/components');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read all SVG files
const svgFiles = fs
  .readdirSync(SVG_DIR)
  .filter((file) => file.endsWith('.svg'))
  .sort();

console.log(`Found ${svgFiles.length} SVG files`);

// Generate component name from filename
function toComponentName(filename) {
  // Remove .svg extension
  const name = filename.replace('.svg', '');
  // Convert kebab-case, snake_case, or spaces to PascalCase
  // Handle spaces by removing them and capitalizing next letter
  return name
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Generate imports and switch cases
const imports = [];
const cases = [];

svgFiles.forEach((svgFile) => {
  const componentName = toComponentName(svgFile);
  const svgName = svgFile.replace('.svg', '');

  imports.push(
    `import ${componentName}Icon from '../assets/icons/${svgFile}';`
  );
  cases.push(
    `    case '${svgName}':\n      return <${componentName}Icon {...props} />;`
  );
});

// Generate component content
const componentContent = `import type { SvgProps } from 'react-native-svg';

${imports.join('\n')}

export type IconClassicName = ${svgFiles.map((f) => `'${f.replace('.svg', '')}'`).join(' | ')};

export interface IconClassicProps extends SvgProps {
  name: IconClassicName;
}

export function IconClassic({ name, ...props }: IconClassicProps) {
  switch (name) {
${cases.join('\n')}
    default:
      return null;
  }
}
`;

// Write the component file
const outputPath = path.join(OUTPUT_DIR, 'IconClassic.tsx');
fs.writeFileSync(outputPath, componentContent, 'utf8');

console.log(`\nGenerated IconClassic.tsx with ${svgFiles.length} icons`);
console.log(`Output: ${outputPath}`);
