import type { ColorsStorageShape } from '../types.js';
import { writeJsonFile } from '../../../scripts-utils/json/writeJsonFile.js';
import { getColorsStoragePath } from './storageFile.js';

export async function setColorsStorage(
  storage: ColorsStorageShape
): Promise<void> {
  await writeJsonFile(getColorsStoragePath(), storage);
}
