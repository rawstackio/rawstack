import { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import styled from 'styled-components/native';
import { Icon, IconElement } from '../Icon/Icon';

interface Props {
  onPress?: () => void;
  size: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  icon: IconElement;
  disabled?: boolean;
  testId?: string;
}

const IconButton = ({
  color,
  onPress,
  size,
  style,
  icon,
  disabled,
  testId,
}: Props) => {
  const pressed = () => {
    if (onPress && !disabled) {
      onPress();
    }
  };

  return (
    <Container
      onPress={pressed}
      style={style}
      disabled={disabled}
      testID={testId ?? 'iconButton-container'}
    >
      <Item
        icon={icon}
        width={size}
        height={size}
        color={color}
        testId={'iconButton-icon'}
      />
    </Container>
  );
};

const Container = styled.Pressable<{ disabled?: boolean }>`
  align-items: center;
  justify-content: center;
  opacity: ${p => (p.disabled ? 0.4 : 1)};
`;

const Item = styled(Icon)`
  color: ${p => p.color ?? p.theme.text};
`;

export default IconButton;
