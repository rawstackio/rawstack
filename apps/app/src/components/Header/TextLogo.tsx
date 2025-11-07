import React from 'react';
import styled from 'styled-components/native';
import { useTheme } from 'styled-components/native';
import { theme } from '../../lib/theme';

const TextLogo = () => {
  const colors = useTheme();

  return (
    <LogoText color={colors.text}>
      <LogoText color={colors.logoGray}>raw</LogoText>
      <LogoText color={colors.logoWhite}>stack</LogoText>
    </LogoText>
  );
};

const LogoText = styled.Text<{ color: string }>`
  color: ${props => props.color};
  font-size: 22px;
  font-family: ${theme.fonts.logo};
`;

export default TextLogo;
