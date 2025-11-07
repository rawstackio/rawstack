import { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import styled from 'styled-components/native';
import Text from '../Text/Text.tsx';
import { theme } from '../../lib/theme';
import { useApp } from '../../lib/context/AppContext.tsx';
import { useAuth } from '../../lib/context/AuthContext.tsx';

interface Props {
  style?: StyleProp<ViewStyle>;
}

const EmailVerificationNotification = ({ style }: Props) => {
  const { user } = useAuth();
  const { setModalConfig, closeModal } = useApp();

  const onUserNotificationPress = () => {
    setModalConfig({
      title: 'Unverified Email',
      content:
        'Your email is not yet verified! Check your email for the verification link or resend the verification link',
      confirmButton: {
        label: 'Resend',
        onPress: async () => {
          closeModal();
        },
      },
    });
  };

  return (
    <Wrapper onPress={onUserNotificationPress} style={style}>
      <Text>Your email is not yet verfied! Check your emails or resend the verification link</Text>
    </Wrapper>
  );
};

const Wrapper = styled.Pressable`
  background: ${p => p.theme.primary};
  padding: ${theme.layout.spacing * 0.33}px ${theme.layout.spacing}px;
`;

export default EmailVerificationNotification;
