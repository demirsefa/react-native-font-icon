import React from 'react';
import type { SvgProps } from 'react-native-svg';

export type FallBackIconName = string;
export type FallBackIconProps = SvgProps & { name: FallBackIconName };

const iconMap: Record<string, React.FC<SvgProps>> = {};

export default function FallBackIcon({ name, ...props }: FallBackIconProps) {
  const Component = iconMap[name];
  if (!Component) {
    return null;
  }
  return <Component {...props} />;
}
