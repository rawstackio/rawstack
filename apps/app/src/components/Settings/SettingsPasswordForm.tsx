import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Dimensions } from 'react-native';
import Input from '../Input/Input';
import { theme } from '../../lib/theme';
import Button from '../Button/Button';
import Api from '../../lib/api/Api.ts';
import { useAuth } from '../../lib/context/AuthContext.tsx';

const width = Dimensions.get('window').width;

type Inputs = {
  password: string;
  confirmPassword: string;
};

interface Props {
  onUpdated: () => void;
}

const SettingsPasswordForm = ({ onUpdated }: Props) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    control,
    getValues,
    handleSubmit,
    // setError,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async data => {
    setIsUpdating(true);

    if (!user) {
      setIsUpdating(false);
      return;
    }

    try {
      await Api.user.usersIdPatch(user.id, {
        password: data.password,
      });

      setIsUpdating(false);
      onUpdated();
    } catch (e) {
      // @todo: handle other errors
    }

    setIsUpdating(false);
  };

  return (
    <Container>
      <Content>
        <InputWrapper>
          <Controller
            control={control}
            name="password"
            rules={{
              required: {
                value: true,
                message: 'Password is required',
              },
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <ModalInput
                placeholder={'New Password'}
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
              validate: value =>
                value === getValues('password') || 'Passwords do not match',
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
        <ModalButton
          onPress={handleSubmit(onSubmit)}
          label={'Update'}
          isBusy={isUpdating}
        />
      </Footer>
    </Container>
  );
};

const ModalButton = styled(Button)`
  padding: 9px ${theme.layout.spacing}px;
`;

const ModalInput = styled(Input)`
  padding: ${theme.layout.spacing * 0.42}px ${theme.layout.spacing * 0.5}px;
`;

const Container = styled.View`
  width: ${width - 48}px;
`;

const Content = styled.View`
  margin-bottom: 2px;
`;
const InputWrapper = styled.View`
  margin-bottom: ${theme.layout.spacing * 0.5}px;
`;

const Footer = styled.View``;

export default SettingsPasswordForm;
