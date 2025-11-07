import { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import styled from 'styled-components/native';
import ChevronLeft from '../Icon/Items/ChevronLeft';

interface Props {
  onPress: () => void;
  size: number;
  style?: StyleProp<ViewStyle>;
}

const BackButton = ({ onPress, size, style }: Props) => {
  return (
    <Container onPress={onPress} style={style} testID={'backButton'}>
      <Back width={size} height={size} />
    </Container>
  );
};

const Container = styled.Pressable`
  padding: 2px;
`;

const Back = styled(ChevronLeft)`
  color: ${p => p.theme.text};
`;

export default BackButton;
