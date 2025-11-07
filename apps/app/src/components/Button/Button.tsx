import { ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import styled from 'styled-components/native';
import { theme } from '../../lib/theme';
import { useTheme } from 'styled-components/native';

interface Props {
  onPress: () => void;
  label: string;
  secondary?: boolean;
  style?: StyleProp<ViewStyle>;
  isBusy?: boolean;
  disabled?: boolean;
}

const Button = ({
  disabled,
  onPress,
  secondary,
  style,
  label,
  isBusy,
}: Props) => {
  const colors = useTheme();

  const press = () => {
    if (!disabled) {
      onPress();
    }
  };

  return (
    <Container
      onPress={press}
      style={style}
      secondary={secondary}
      disabled={disabled}
      testID={'button'}
    >
      {isBusy ? (
        <ActivityIndicator
          size="small"
          color={secondary ? colors.background : colors.text}
          testID={'button-activityIndicator'}
        />
      ) : (
        <Label secondary={secondary} testID={'button-label'}>
          {label}
        </Label>
      )}
    </Container>
  );
};

const Container = styled.Pressable<{ secondary?: boolean; disabled?: boolean }>`
  padding: ${theme.layout.spacing * 0.5}px ${theme.layout.spacing * 1.2}px;
  background: ${p => (p.secondary ? p.theme.text : p.theme.primary ?? 'black')};
  border: solid 1px ${p => (p.secondary ? p.theme.text : p.theme.primary)};
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  opacity: ${p => (p.disabled ? 0.5 : 0.8)};
`;

const Label = styled.Text<{ secondary?: boolean }>`
  color: ${p => p.theme.background ?? 'transparent'};
  font-weight: bold;
`;

export default Button;
