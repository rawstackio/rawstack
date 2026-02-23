import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components/native';
import Input from '../Input/Input';
import { theme } from '../../lib/theme';
import Button from '../Button/Button';
import { validation } from '../../lib/config/forms';
import { useRegister } from '../../hooks/auth/use-register';
import { ApiError } from '../../lib/api/exception/errors.ts';

type Inputs = {
  email: string;
  password: string;
  confirmPassword: string;
};

interface Props {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  formErrors?: string[];
}

const SignupForm = ({ formErrors, onSuccess, onError }: Props) => {
  const {
    control,
    getValues,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>();

  const { register, isBusy } = useRegister({
    onSuccess,
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.statusCode === 409) {
        setError('email', {
          type: 'custom',
          message: 'A user with this email already exists',
        });
      } else {
        onError?.(error);
      }
    },
  });

  const onSubmit: SubmitHandler<Inputs> = data => {
    register({
      email: data.email.toLowerCase(),
      password: data.password,
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
            rules={validation.email}
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
        <InputWrapper>
          <Controller
            control={control}
            name="password"
            rules={validation.password}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                placeholder={'Password'}
                secureTextEntry={true}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />
        </InputWrapper>
        <InputWrapper>
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              validate: value => value === getValues('password') || 'Passwords do not match',
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                placeholder={'Confirm Password'}
                secureTextEntry={true}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </InputWrapper>
      </Content>
      <Footer>
        <Button secondary={true} onPress={handleSubmit(onSubmit)} label={'Create Account'} isBusy={isBusy} />
      </Footer>
    </Container>
  );
};

const Container = styled.View``;
const Content = styled.View``;
const InputWrapper = styled.View`
  margin-bottom: ${theme.layout.spacing * 0.5}px;
`;

const Footer = styled.View``;

const ErrorText = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: ${p => p.theme.error};
  padding: 0 0 ${theme.layout.spacing * 0.5}px ${theme.layout.spacing * 0.5}px;
`;

export default SignupForm;
