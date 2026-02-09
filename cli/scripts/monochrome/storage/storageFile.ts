import { STORAGE_FILE } from '../constants.js';
import { resolveFromImportMeta } from '../../../scripts-utils/path/resolveFromImportMeta.js';

export function getStoragePath(): string {
  // cli/scripts/monochrome/storage -> cli/scripts/monochrome
  return resolveFromImportMeta(import.meta.url, '..', STORAGE_FILE);
}
