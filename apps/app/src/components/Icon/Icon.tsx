import React, { CSSProperties, JSX, SVGProps } from 'react';

export type IconElement = (props: SVGProps<SVGSVGElement>) => JSX.Element;

interface IconProps {
  width: number;
  height?: number;
  color?: string;
  icon: IconElement;
  style?: CSSProperties;
  testId?: string;
}

export type IconSvgProps = Pick<React.SVGProps<SVGSVGElement>, 'color' | 'width' | 'height'>;

export const Icon: React.FC<IconProps> = ({ width, height, color, icon, style }) => {
  if (!height) {
    height = width;
  }

  const IconComponent = icon;
  return <IconComponent width={width} height={height} color={color} style={style} />;
};
