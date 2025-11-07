import React from 'react';
import styled from 'styled-components/native';
import { theme } from '../../lib/theme';
import BackButton from '../Button/BackButton';

interface Props {
  title: string;
  onBack: () => void;
}

const SecondaryHeader = ({ onBack, title }: Props) => {
  return (
    <Container>
      <BackButton size={24} onPress={onBack} />
      <Title>{title}</Title>
      <Spacer />
    </Container>
  );
};

const Container = styled.View`
  margin-top: ${theme.layout.spacing * 0.7}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${theme.layout.spacing * 0.5}px ${theme.layout.spacing * 0.5}px;
`;

const Spacer = styled.View`
  width: 24px;
  position: relative;
`;

const Title = styled.Text`
  color: ${p => p.theme.text};
  font-size: 18px;
  font-weight: bold;
`;

export default SecondaryHeader;
