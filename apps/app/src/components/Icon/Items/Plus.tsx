import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconSvgProps } from '../Icon';

function Plus(props: IconSvgProps) {
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
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export default Plus;
