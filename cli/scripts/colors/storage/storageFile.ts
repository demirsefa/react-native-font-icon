import { resolveFromImportMeta } from '../../../scripts-utils/path/resolveFromImportMeta.js';

export function getColorsStoragePath(): string {
  // cli/scripts/colors/storage -> cli/scripts/colors
  return resolveFromImportMeta(import.meta.url, '..', 'storage.json');
}
