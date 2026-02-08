import fs from 'node:fs';

export async function writeJsonFile(
  filePath: string,
  value: unknown
): Promise<void> {
  await fs.promises.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}
