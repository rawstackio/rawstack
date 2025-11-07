import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconSvgProps } from '../Icon';

function IconMoon(props: IconSvgProps) {
  return (
    <Svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      {...props}>
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </Svg>
  );
}

export default IconMoon;
