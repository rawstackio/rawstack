import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components/native';
import Input from '../Input/Input';
import { theme } from '../../lib/theme';
import Button from '../Button/Button';
import UserModel from '../../lib/model/UserModel';
import { UserCredentials } from '../../lib/context/AuthContext';
import { validation } from '../../lib/config/forms';
import Api from '../../lib/api/Api';
import { ApiError } from '../../lib/api/exception/errors.ts';

type Inputs = {
  email: string;
  password: string;
  confirmPassword: string;
};

interface Props {
  onUserCreated: (user: UserModel, credentials: UserCredentials) => void;
  isBusy?: boolean;
  formErrors?: string[];
}

const SignupForm = ({ formErrors, isBusy, onUserCreated }: Props) => {
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const {
    control,
    getValues,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async data => {
    setIsCreatingUser(true);

    try {
      const response = await Api.user.createUser({
        email: data.email.toLowerCase(),
        password: data.password,
      });

      onUserCreated(UserModel.createFromApiUser(response.data.item), {
        email: data.email.toLowerCase(),
        password: data.password,
      });
    } catch (e: unknown) {
      console.log({ e });
      if (e instanceof ApiError && e.statusCode === 409) {
        setError('email', {
          type: 'custom',
          message: 'A user with this email already exists',
        });
      } else {
        // @todo...
      }
    }
    setIsCreatingUser(false);
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
        <Button
          secondary={true}
          onPress={handleSubmit(onSubmit)}
          label={'Create Account'}
          isBusy={isBusy || isCreatingUser}
        />
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
