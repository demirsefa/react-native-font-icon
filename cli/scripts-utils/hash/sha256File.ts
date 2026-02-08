import { createHash } from 'node:crypto';
import fs from 'node:fs';

export async function sha256FileUtf8(filePath: string): Promise<string> {
  const content = await fs.promises.readFile(filePath, 'utf8');
  return createHash('sha256').update(content).digest('hex');
}
