export function normalizeSvgContent(svgContent: string): string {
  let result = svgContent;
  const hasPlainHref = /<use\b[^>]*\bhref="/i.test(result);

  if (hasPlainHref) {
    result = result.replace(/<use\b([^>]*?)\bhref=/gi, (match, attrs) => {
      if (match.includes('xlink:href')) {
        return match;
      }

      return `<use${attrs} xlink:href=`;
    });

    if (!/xmlns:xlink=/.test(result)) {
      result = result.replace(
        /<svg\b([^>]*?)>/i,
        (_match, attrs) =>
          `<svg${attrs} xmlns:xlink="http://www.w3.org/1999/xlink">`
      );
    }
  }

  return result;
}

