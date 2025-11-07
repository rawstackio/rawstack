import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconSvgProps } from '../Icon';

function Repeat(props: IconSvgProps) {
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
      <Path d="M17 1l4 4-4 4" />
      <Path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4" />
      <Path d="M21 13v2a4 4 0 01-4 4H3" />
    </Svg>
  );
}

export default Repeat;
