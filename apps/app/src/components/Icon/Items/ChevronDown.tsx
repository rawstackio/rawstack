import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconSvgProps } from '../Icon';

function ChevronDown(props: IconSvgProps) {
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
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

export default ChevronDown;
