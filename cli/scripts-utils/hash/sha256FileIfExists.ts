import fs from 'node:fs';

import { sha256FileUtf8 } from './sha256File.ts';

export async function sha256FileUtf8IfExists(
  filePath: string
): Promise<string | null> {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
  } catch {
    return null;
  }
  return await sha256FileUtf8(filePath);
}
