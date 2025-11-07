import { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import styled from 'styled-components/native';
import X from '../Icon/Items/X';
import { Icon } from '../Icon/Icon';

interface Props {
  onPress: () => void;
  size: number;
  style?: StyleProp<ViewStyle>;
}

const CloseButton = ({ onPress, size, style }: Props) => {
  return (
    <Container onPress={onPress} style={style} testID={'closeButton'}>
      <Cross width={size} icon={X} />
    </Container>
  );
};

const Container = styled.Pressable`
  padding: 2px;
`;

const Cross = styled(Icon)`
  color: ${p => p.theme.text};
`;

export default CloseButton;
