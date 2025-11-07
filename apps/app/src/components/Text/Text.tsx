import styled from 'styled-components/native';
import { TextProps } from 'react-native';

interface Props {
  primary?: boolean;
}

const ThemeAwareText = ({ children, primary, ...rest }: Props & TextProps) => {
  return (
    <Text {...rest} primary={primary}>
      {children}
    </Text>
  );
};

// color: ${p => p.primary ? p.theme.primary : p.theme.text};
const Text = styled.Text<{ primary?: boolean }>`
  color: ${p => (p.primary ? p.theme.primary : p.theme.text)};
`;

export default ThemeAwareText;
