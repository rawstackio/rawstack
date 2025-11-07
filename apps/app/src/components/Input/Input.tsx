import { StyleProp, TextInput, TextInputProps, ViewStyle } from 'react-native';
import React from 'react';
import styled from 'styled-components/native';
import { theme } from '../../lib/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

const Input = ({ error, label, wrapperStyle, style, ...rest }: Props) => {
  return (
    <Wrapper style={wrapperStyle}>
      <Container style={style}>
        {label && <Label>{label}</Label>}
        <RNInput {...rest} />
      </Container>
      {error && <Error>{error}</Error>}
    </Wrapper>
  );
};

const Wrapper = styled.View``;

const Container = styled.View`
  border: solid 1px ${p => p.theme.inputBorder};
  padding: ${theme.layout.spacing * 0.5}px ${theme.layout.spacing * 0.5}px;
  border-radius: 4px;
`;

const Label = styled.Text`
  color: ${p => p.theme.inputLabel};
  font-size: 11px;
  text-transform: uppercase;
`;

const Error = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: ${p => p.theme.error};
  padding: ${theme.layout.spacing * 0.2}px 0 0 ${theme.layout.spacing * 0.5}px;
`;

const RNInput = styled(TextInput).attrs(p => ({
  placeholderTextColor: p.theme.inputLabel,
}))`
  color: ${p => p.theme.inputColor};
  font-size: 14px;
`;

export default Input;
