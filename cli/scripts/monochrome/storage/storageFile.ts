import { STORAGE_FILE } from '../constants.ts';
import { resolveFromImportMeta } from '../../../scripts-utils/path/resolveFromImportMeta.ts';

export function getStoragePath(): string {
  // cli/scripts/monochrome/storage -> cli/scripts/monochrome
  return resolveFromImportMeta(import.meta.url, '..', STORAGE_FILE);
}
