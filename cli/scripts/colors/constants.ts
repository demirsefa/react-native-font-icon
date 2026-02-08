import type { ColorTarget } from './types.ts';

export const DEFAULT_FONT_NAME = 'font-family';

export const COLOR_TARGETS: ColorTarget[] = [
  { format: 'glyf_colr_1', extension: '.ttf', label: 'android' },
  { format: 'sbix', extension: '.ttf', label: 'ios' },
];

export const CONFIG_FOLDER_NAME = 'config';
export const STAGING_FOLDER_NAME = 'fonticon-assets';

export const PUA_START = 0xe000;
export const PUA_END = 0xf8ff;
