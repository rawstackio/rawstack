import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconSvgProps } from '../Icon';

function Database(props: IconSvgProps) {
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
      <Path d="M21 5 A9 3 0 0 1 12 8 A9 3 0 0 1 3 5 A9 3 0 0 1 21 5 z" />
      <Path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <Path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </Svg>
  );
}

export default Database;
