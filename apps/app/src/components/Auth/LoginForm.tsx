import React from 'react';
import styled from 'styled-components/native';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import Input from '../Input/Input';
import { theme } from '../../lib/theme';
import Button from '../Button/Button';
import { UserCredentials } from '../../lib/context/AuthContext';

type Inputs = {
  email: string;
  password: string;
  errors?: string[];
};

interface Props {
  onLogin: (credentials: UserCredentials) => void;
  isBusy?: boolean;
  formErrors?: string[];
}

const LoginForm = ({ formErrors, isBusy, onLogin }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = data => {
    onLogin(data);
  };

  return (
    <Container>
      <Content>
        {formErrors &&
          formErrors.map((error, index) => (
            <ErrorText key={index}>{error}</ErrorText>
          ))}
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
        <InputWrapper>
          <Controller
            control={control}
            name="password"
            rules={{
              required: {
                value: true,
                message: 'Password is required',
              },
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            }}
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
      </Content>
      <Footer>
        <Button
          secondary={true}
          onPress={handleSubmit(onSubmit)}
          label={'Login'}
          isBusy={isBusy}
        />
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

export default LoginForm;
