import type { StorageShape } from '../types.ts';
import { getStoragePath } from './storageFile.ts';
import { writeJsonFile } from '../../../scripts-utils/json/writeJsonFile.ts';

export async function setStorage(storage: StorageShape): Promise<void> {
  await writeJsonFile(getStoragePath(), storage);
}

