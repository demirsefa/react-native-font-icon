export function buildConfigContent(params: {
  family: string;
  outputFile: string;
  colorFormat: string;
  relativeSrcs: string[];
}): string {
  const { family, outputFile, colorFormat, relativeSrcs } = params;
  const srcList = relativeSrcs
    .map((src) => `"${src.replace(/\\/g, '/')}"`)
    .join(', ');

  return `family = "${family}"
output_file = "${outputFile}"
color_format = "${colorFormat}"
clipbox_quantization = 32

[axis.wght]
name = "Weight"
default = 400

[master.regular]
style_name = "Regular"
srcs = [${srcList}]

[master.regular.position]
wght = 400
`;
}
