import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconSvgProps } from '../Icon';

function IconMenuLeft(props: IconSvgProps) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <Path
        fill="currentColor"
        d="M2 5.995c0-.55.446-.995.995-.995h8.01a.995.995 0 010 1.99h-8.01A.995.995 0 012 5.995zM2 12c0-.55.446-.995.995-.995h18.01a.995.995 0 110 1.99H2.995A.995.995 0 012 12zM2.995 17.01a.995.995 0 000 1.99h12.01a.995.995 0 000-1.99H2.995z"
      />
    </Svg>
  );
}

export default IconMenuLeft;
