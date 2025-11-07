import React, { FC, PropsWithChildren } from 'react';
import styled from 'styled-components/native';
import { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../Header/Header';

type Props = {
  style?: StyleProp<ViewStyle>;
  hideHeader?: boolean;
  edges?: Array<'right' | 'bottom' | 'left' | 'top'>;
};
const Screen: FC<PropsWithChildren<Props>> = ({
  children,
  hideHeader,
  style,
  edges,
}) => {
  return (
    <Container style={style} edges={edges ?? ['top']}>
      {!hideHeader && <Header />}
      {children}
    </Container>
  );
};

const Container = styled(SafeAreaView)`
  background: ${p => p.theme.background};
  flex: 1;
`;

export default Screen;
