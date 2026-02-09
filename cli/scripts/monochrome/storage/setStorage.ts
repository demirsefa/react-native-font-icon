import type { StorageShape } from '../types.js';
import { getStoragePath } from './storageFile.js';
import { writeJsonFile } from '../../../scripts-utils/json/writeJsonFile.js';

export async function setStorage(storage: StorageShape): Promise<void> {
  await writeJsonFile(getStoragePath(), storage);
}
