## svg/

Bu klasör; SVG discovery + pre-processing + staging adımlarını içerir.

- `collectSvgFiles`: recursive SVG toplama
- `shouldSkipSvg`: unsupported pattern erken eleme
- `normalizeSvgContent`: xlink/href normalize
- `stageSvgFiles`: codepoint mapping + staging write (sanitize hook burada)
