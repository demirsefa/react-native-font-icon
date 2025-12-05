const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execFile, spawn } = require('child_process');

const execFileAsync = promisify(execFile);

const DEFAULT_FONT_NAME = 'font-family';
const COLOR_TARGETS = [
  // Android uses glyf_colr_1, which is well supported on modern Android
  { format: 'glyf_colr_1', extension: '.ttf', label: 'android' },
  // iOS has better support for sbix bitmap color fonts than for custom COLR fonts
  { format: 'sbix', extension: '.ttf', label: 'ios' },
];
const CONFIG_FOLDER_NAME = 'config';
const STAGING_FOLDER_NAME = 'fonticon-assets';
const COLOR_FONTS_ENV = 'RN_FONT_ICON_COLOR_FONTS_PATH';

async function pathExists(targetPath) {
  try {
    await fs.promises.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolvePythonBinary(explicitBinary) {
  const candidates = [];
  if (explicitBinary) {
    const absolute = path.isAbsolute(explicitBinary)
      ? explicitBinary
      : path.resolve(process.cwd(), explicitBinary);
    candidates.push(absolute);
  }

  candidates.push('python3', 'python');

  for (const candidate of candidates) {
    try {
      await execFileAsync(candidate, ['--version']);
      return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error(
    'Python is required. Please install Python 3 and ensure it is available on your PATH.'
  );
}

async function resolveColorFontsRepoPath(explicitPath) {
  const repoRoot = path.resolve(__dirname, '../../..');
  const candidates = [
    explicitPath,
    process.env[COLOR_FONTS_ENV],
    path.join(process.cwd(), 'color-fonts'),
    path.join(repoRoot, 'example', 'color-fonts'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const buildScript = path.join(candidate, 'build.py');
    if (await pathExists(buildScript)) {
      return candidate;
    }
  }

  throw new Error(
    `Unable to locate the googlefonts/color-fonts repository. Pass --color-fonts, set ${COLOR_FONTS_ENV}, or clone the repo next to your project.`
  );
}

async function collectSvgFiles(folderPath) {
  async function walk(currentPath, files) {
    const entries = await fs.promises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath, files);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) {
        files.push(entryPath);
      }
    }
    return files;
  }

  return walk(folderPath, []);
}

const PUA_START = 0xe000;
const PUA_END = 0xf8ff;

async function stageSvgFiles(svgFiles, stagingDir, configDir) {
  await fs.promises.rm(stagingDir, { recursive: true, force: true });
  await fs.promises.mkdir(stagingDir, { recursive: true });

  const stagedRelativePaths = [];
  const glyphMappings = [];

  let processedCount = 0;

  for (const svgPath of svgFiles) {
    const parsed = path.parse(svgPath);
    const content = await fs.promises.readFile(svgPath, 'utf8');
    if (shouldSkipSvg(content)) {
      console.warn(
        `Skipping ${parsed.base} because it uses clipPath references unsupported gradients.`
      );
      continue;
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

function normalizeSvgContent(svgContent) {
  let result = svgContent;
  const hasPlainHref = /<use\b[^>]*\bhref="/i.test(result);

  if (hasPlainHref) {
    result = result.replace(/<use\b([^>]*?)\bhref=/gi, (match, attrs) => {
      if (match.includes('xlink:href')) {
        return match;
      }

      return `<use${attrs} xlink:href=`;
    });

    if (!/xmlns:xlink=/.test(result)) {
      result = result.replace(
        /<svg\b([^>]*?)>/i,
        (match, attrs) =>
          `<svg${attrs} xmlns:xlink="http://www.w3.org/1999/xlink">`
      );
    }
  }

  return result;
}

function shouldSkipSvg(svgContent) {
  const clipPathRegex = /<clipPath\b[^>]*>([\s\S]*?)<\/clipPath>/gi;
  let clipMatch;

  while ((clipMatch = clipPathRegex.exec(svgContent)) !== null) {
    const clipBlock = clipMatch[1];
    const useMatch = /<use\b[^>]*href=["']#([^"']+)["']/i.exec(clipBlock);

    if (!useMatch) {
      continue;
    }

    const referencedId = useMatch[1];
    const gradientRegex = new RegExp(
      `<(?:radial|linear)Gradient\\b[^>]*id=["']${referencedId}["']`,
      'i'
    );

    if (gradientRegex.test(svgContent)) {
      return true;
    }
  }

  return false;
}

function buildConfigContent({ family, outputFile, colorFormat, relativeSrcs }) {
  const srcList = relativeSrcs
    .map((src) => `"${src.replace(/\\/g, '/')}"`)
    .join(', ');
  return `family = "${family}"
output_file = "${outputFile}"
color_format = "${colorFormat}"
clipbox_quantization = 32

[axis.wght]
name = "Weight"
default = 400

[master.regular]
style_name = "Regular"
srcs = [${srcList}]

[master.regular.position]
wght = 400
`;
}

async function createConfigFiles({ configDir, fontName, relativeSrcs }) {
  const configs = [];
  for (const target of COLOR_TARGETS) {
    const fileName = `${fontName}-${target.format}.toml`;
    const configPath = path.join(configDir, fileName);
    const outputFile = `${fontName}-${target.format}${target.extension}`;
    const content = buildConfigContent({
      family: `${fontName}-${target.label}`,
      outputFile,
      colorFormat: target.format,
      relativeSrcs,
    });
    await fs.promises.writeFile(configPath, content, 'utf8');
    configs.push({
      configPath,
      outputFile,
      label: target.label,
      extension: target.extension,
    });
  }
  return configs;
}

function spawnWithLogs(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runBuild(pythonBinary, repoPath, configs) {
  const configArgs = configs.map((config) =>
    path.relative(repoPath, config.configPath).replace(/\\/g, '/')
  );
  const extraPathEntries = path.isAbsolute(pythonBinary)
    ? [path.dirname(pythonBinary)]
    : [];
  const mergedPath = [...extraPathEntries, process.env.PATH || '']
    .filter(Boolean)
    .join(path.delimiter);

  await spawnWithLogs(pythonBinary, ['build.py', ...configArgs], {
    cwd: repoPath,
    env: {
      ...process.env,
      PATH: mergedPath,
    },
  });
}

async function copyOutputFonts(repoPath, outputFolder, configs, fontName) {
  const fontsDir = path.join(repoPath, 'fonts');
  await fs.promises.mkdir(outputFolder, { recursive: true });
  const results = [];

  for (const config of configs) {
    const sourceFont = path.join(fontsDir, config.outputFile);
    if (!(await pathExists(sourceFont))) {
      throw new Error(
        `Expected font ${config.outputFile} was not generated. Check the build output above for details.`
      );
    }
    const destinationFileName = `${fontName}-${config.label}${config.extension}`;
    const destinationPath = path.join(outputFolder, destinationFileName);
    await fs.promises.copyFile(sourceFont, destinationPath);
    results.push({
      platform: config.label,
      path: destinationPath,
    });
  }

  return results;
}

async function cleanup(configs, stagingDir) {
  await Promise.all(
    configs.map((config) => fs.promises.rm(config.configPath, { force: true }))
  );
  await fs.promises.rm(stagingDir, { recursive: true, force: true });
}
async function writeGlyphMetadata({ glyphMappings, outputFolder, fontName }) {
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

async function generateColorFonts({
  assetsFolder,
  outputFolder,
  colorFontsRepoPath,
  pythonBinary,
  fontName = DEFAULT_FONT_NAME,
}) {
  if (!assetsFolder || !outputFolder) {
    throw new Error('Both assetsFolder and outputFolder are required.');
  }

  if (!(await pathExists(assetsFolder))) {
    throw new Error(`Assets folder does not exist: ${assetsFolder}`);
  }

  const svgFiles = await collectSvgFiles(assetsFolder);
  if (svgFiles.length === 0) {
    throw new Error(`No SVG files found under ${assetsFolder}`);
  }

  const repoPath = await resolveColorFontsRepoPath(colorFontsRepoPath);
  const python = await resolvePythonBinary(pythonBinary);
  const configDir = path.join(repoPath, CONFIG_FOLDER_NAME);
  const stagingDir = path.join(configDir, STAGING_FOLDER_NAME);
  const { stagedRelativePaths, glyphMappings } = await stageSvgFiles(
    svgFiles,
    stagingDir,
    configDir
  );
  const configs = await createConfigFiles({
    configDir,
    fontName,
    relativeSrcs: stagedRelativePaths,
  });

  try {
    await runBuild(python, repoPath, configs);
    const outputs = await copyOutputFonts(
      repoPath,
      outputFolder,
      configs,
      fontName
    );
    const glyphMapPath = await writeGlyphMetadata({
      glyphMappings,
      outputFolder,
      fontName,
    });
    return {
      generated: true,
      pythonBinary: python,
      colorFontsRepoPath: repoPath,
      glyphMapPath,
      outputs,
    };
  } finally {
    await cleanup(configs, stagingDir);
  }
}

module.exports = {
  generateColorFonts,
  resolveColorFontsRepoPath,
  resolvePythonBinary,
};
