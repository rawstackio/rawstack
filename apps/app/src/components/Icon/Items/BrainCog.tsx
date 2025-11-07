import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconSvgProps } from '../Icon';

function IconBrainCog(props: IconSvgProps) {
  return (
    <Svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      {...props}>
      <Path d="M12 4.5a2.5 2.5 0 00-4.96-.46 2.5 2.5 0 00-1.98 3 2.5 2.5 0 00-1.32 4.24 3 3 0 00.34 5.58 2.5 2.5 0 002.96 3.08A2.5 2.5 0 009.5 22c1.21 0 2.5-.74 2.5-2.5m0-15a2.5 2.5 0 014.96-.46 2.5 2.5 0 011.98 3 2.5 2.5 0 011.32 4.24 3 3 0 01-.34 5.58 2.5 2.5 0 01-2.96 3.08A2.5 2.5 0 0114.5 22c-1.21 0-2.5-.74-2.5-2.5m0-15V5m0 14.5V19" />
      <Path d="M14 12 A2 2 0 0 1 12 14 A2 2 0 0 1 10 12 A2 2 0 0 1 14 12 z" />
      <Path d="M12 9v1M12 14v1M14.6 10.5l-.87.5M10.27 13l-.87.5M14.6 13.5l-.87-.5M10.27 11l-.87-.5" />
    </Svg>
  );
}

export default IconBrainCog;
