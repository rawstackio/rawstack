import React from 'react';
import Toast from 'react-native-toast-message';
import styled from 'styled-components/native';
import Input from '../Input/Input';
import { theme } from '../../lib/theme';
import Button from '../Button/Button';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Api from '../../lib/api/Api';

type Inputs = {
  email: string;
};

interface Props {
  isBusy?: boolean;
  formErrors?: string[];
}

const PasswordResetRequestForm = ({ isBusy, formErrors }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async data => {
    try {
      const response = await Api.auth.createToken({
        email: data.email.toLowerCase(),
      });
      const item = response.data.item;

      if ('action' in item && item.action === 'CHECK_EMAIL') {
        Toast.show({
          type: 'success',
          text1: 'A password reset link has been sent to your email address',
          text2: 'A password reset link has been sent to your email address',
        });

        // clear the form
      }
    } catch (e) {
      // @todo:oops model
    }
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
