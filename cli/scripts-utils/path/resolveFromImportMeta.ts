import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveFromImportMeta(metaUrl: string, ...segments: string[]) {
  const here = path.dirname(fileURLToPath(metaUrl));
  return path.resolve(here, ...segments);
}

