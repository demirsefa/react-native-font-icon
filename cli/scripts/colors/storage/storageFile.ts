import { resolveFromImportMeta } from '../../../scripts-utils/path/resolveFromImportMeta.ts';

export function getColorsStoragePath(): string {
  // cli/scripts/colors/storage -> cli/scripts/colors
  return resolveFromImportMeta(import.meta.url, '..', 'storage.json');
}

