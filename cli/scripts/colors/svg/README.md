## svg/

This folder contains the SVG discovery, pre-processing, and staging steps.

- `collectSvgFiles`: recursively collects SVG files
- `shouldSkipSvg`: early filter for unsupported patterns
- `normalizeSvgContent`: normalizes `xlink:href` / `href` usage
- `stageSvgFiles`: assigns codepoints + writes staged SVGs (sanitize hook lives here)
