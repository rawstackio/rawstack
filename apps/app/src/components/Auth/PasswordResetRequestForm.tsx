import React from 'react';
import Toast from 'react-native-toast-message';
import styled from 'styled-components/native';
import Input from '../Input/Input';
import { theme } from '../../lib/theme';
import Button from '../Button/Button';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useCreatePasswordResetRequest } from '../../hooks/password/use-create-password-reset-request';

type Inputs = {
  email: string;
};

interface Props {
  onSuccess?: (email: string) => void;
  onError?: (error: unknown) => void;
  formErrors?: string[];
}

const PasswordResetRequestForm = ({ formErrors, onSuccess, onError }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const { createPasswordResetRequest, isBusy } = useCreatePasswordResetRequest({
    onSuccess: (email: string) => {
      Toast.show({
        type: 'success',
        text1: 'A password reset link has been sent to your email address',
      });
      reset();
      onSuccess?.(email);
    },
    onError,
  });

  const onSubmit: SubmitHandler<Inputs> = data => {
    createPasswordResetRequest({
      email: data.email.toLowerCase(),
    });
  };

  return (
    <Container>
      <Content>
        {formErrors && formErrors.map((error, index) => <ErrorText key={index}>{error}</ErrorText>)}
        <InputWrapper>
          <Controller
            control={control}
            name="email"
            rules={{
              required: {
                value: true,
                message: 'Email is required',
              },
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'A valid email is required',
              },
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                placeholder={'Email'}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />
        </InputWrapper>
      </Content>
      <Footer>
        <Button secondary={true} label={'Reset Password'} onPress={handleSubmit(onSubmit)} isBusy={isBusy} />
      </Footer>
    </Container>
  );
};

const Container = styled.View``;
const Content = styled.View``;
const Footer = styled.View``;

const InputWrapper = styled.View`
  margin-bottom: ${theme.layout.spacing * 0.5}px;
`;

const ErrorText = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: ${p => p.theme.error};
  padding: 0 0 ${theme.layout.spacing * 0.5}px ${theme.layout.spacing * 0.5}px;
`;

export default PasswordResetRequestForm;
