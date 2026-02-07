import fs from 'node:fs';

export async function getFolderMtimeIso(
  folderPath: string
): Promise<string | null> {
  try {
    const stat = await fs.promises.stat(folderPath);
    return stat.mtime.toISOString();
  } catch (error: unknown) {
    const maybeCode = (error as { code?: unknown } | null)?.code;
    if (maybeCode === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

