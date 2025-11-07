import {
  StyleProp,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import styled from 'styled-components/native';
import { theme } from '../../lib/theme';

interface Props extends TextInputProps {
  error?: string;
  style?: StyleProp<ViewStyle>;
}

const SettingsInput = ({ error, style, ...rest }: Props) => {
  return (
    <View>
      <Container style={style}>
        <RNInput {...rest} multiline={true} numberOfLines={4} />
      </Container>
      {error && <Error>{error}</Error>}
    </View>
  );
};

const Container = styled.View`
  margin: 12px 0;
  border: solid 0 ${p => p.theme.inputBorder};
  padding: ${theme.layout.spacing * 0.5}px 24px;
  border-bottom-width: 1px;
  border-top-width: 1px;
  background: ${p => p.theme.inputBackground};
`;

const RNInput = styled(TextInput).attrs(p => ({
  placeholderTextColor: p.theme.inputLabel,
}))`
  color: ${p => p.theme.inputColor};
  height: 100px;
`;

const Error = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: ${p => p.theme.error};
  padding: ${theme.layout.spacing * 0.2}px 0 0 ${theme.layout.spacing * 0.5}px;
`;

export default SettingsInput;
