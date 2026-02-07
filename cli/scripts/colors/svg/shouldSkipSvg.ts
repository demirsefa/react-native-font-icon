export function shouldSkipSvg(svgContent: string): boolean {
  const clipPathRegex = /<clipPath\b[^>]*>([\s\S]*?)<\/clipPath>/gi;
  let clipMatch: RegExpExecArray | null;

  while ((clipMatch = clipPathRegex.exec(svgContent)) !== null) {
    const clipBlock = clipMatch[1] ?? '';
    const useMatch = /<use\b[^>]*href=["']#([^"']+)["']/i.exec(clipBlock);

    if (!useMatch) {
      continue;
    }

    const referencedId = useMatch[1] ?? '';
    if (!referencedId) {
      continue;
    }
    const gradientRegex = new RegExp(
      `<(?:radial|linear)Gradient\\b[^>]*id=["']${referencedId}["']`,
      'i'
    );

    if (gradientRegex.test(svgContent)) {
      return true;
    }
  }

  return false;
}
