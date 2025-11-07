import React from 'react';
import styled from 'styled-components/native';
import { ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'styled-components/native';

interface Props {
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const Spinner = ({ color, style }: Props) => {
  const colors = useTheme();
  if (!color) {
    color = colors.primary;
  }

  return (
    <Container style={style} testID={'container'}>
      <ActivityIndicator
        testID={'activity-indicator'}
        size="small"
        color={color}
      />
    </Container>
  );
};

const Container = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Spinner;
