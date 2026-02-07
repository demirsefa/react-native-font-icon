import fs from 'node:fs';
import path from 'node:path';

export async function collectSvgFiles(folderPath: string): Promise<string[]> {
  async function walk(currentPath: string, files: string[]) {
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
