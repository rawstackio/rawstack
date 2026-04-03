import { StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import styled from 'styled-components/native';
import Text from '../Text/Text.tsx';
import { theme } from '../../lib/theme';
import { useApp } from '../../lib/context/AppContext.tsx';
import { useAuth } from '../../lib/context/AuthContext.tsx';
import { useUpdateUserEmail } from '../../hooks/user/use-update-user-email.ts';

interface Props {
  style?: StyleProp<ViewStyle>;
  onSuccess?: () => void;
}

const EmailVerificationNotification = ({ style, onSuccess }: Props) => {
  const { user } = useAuth();
  const { setModalConfig, closeModal } = useApp();

  const { updateUserEmail } = useUpdateUserEmail();

  const text = `Your email "${user?.unverifiedEmail}" is not yet verified! Check your email or resend the verification link`;

  const initialEmailVerificationScreen = () => {
    setModalConfig({
      title: 'Email verification token sent',
      content: 'Please check your email for the verification link',
      confirmButton: {
        label: 'Ok',
        onPress: async () => {
          closeModal();
          if (onSuccess) {
            onSuccess();
          }
        },
      },
    });
  };

  const onUserNotificationPress = () => {
    if (user) {
      setModalConfig({
        title: 'Unverified Email',
        content: text,
        confirmButton: {
          label: 'Resend',
          onPress: async () => {
            updateUserEmail({ userId: user.id, email: user.unverifiedEmail! });
            initialEmailVerificationScreen();
          },
        },
      });
    }
  };

  return (
    <Wrapper onPress={onUserNotificationPress} style={style}>
      <Text>{text}</Text>
    </Wrapper>
  );
};

const Wrapper = styled.Pressable`
  background: ${p => p.theme.primary};
  padding: ${theme.layout.spacing * 0.33}px ${theme.layout.spacing}px;
`;

export default EmailVerificationNotification;
