import type { ColorsStorageShape } from '../types.ts';
import { writeJsonFile } from '../../../scripts-utils/json/writeJsonFile.ts';
import { getColorsStoragePath } from './storageFile.ts';

export async function setColorsStorage(
  storage: ColorsStorageShape
): Promise<void> {
  await writeJsonFile(getColorsStoragePath(), storage);
}
