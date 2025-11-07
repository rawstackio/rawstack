import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Dimensions } from 'react-native';
import Input from '../Input/Input';
import { theme } from '../../lib/theme';
import Button from '../Button/Button';
import { validation } from '../../lib/config/forms';
import { useAuth } from '../../lib/context/AuthContext';
import Api from '../../lib/api/Api';
import { ApiError } from '../../lib/api/exception/errors';

const width = Dimensions.get('window').width;

type Inputs = {
  email: string;
  confirmEmail: string;
};

interface Props {
  onUpdated: () => void;
}

const SettingsEmailForm = ({ onUpdated }: Props) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    control,
    getValues,
    handleSubmit,
    setError,
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
        email: data.email.toLowerCase(),
      });

      setIsUpdating(false);
      onUpdated();
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 409) {
        setError('email', {
          type: 'custom',
          message: 'A user with this email already exists',
        });
      }
      throw e;
    }

    setIsUpdating(false);
  };

  return (
    <Container>
      <Content>
        <InputWrapper>
          <Controller
            control={control}
            name="email"
            rules={validation.email}
            render={({ field: { onChange, value, onBlur } }) => (
              <ModalInput
                placeholder={'New Email'}
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
            name="confirmEmail"
            rules={{
              validate: value => value === getValues('email') || 'Emails do not match',
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <ModalInput
                placeholder={'Confirm Email'}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.confirmEmail?.message}
              />
            )}
          />
        </InputWrapper>
      </Content>
      <Footer>
        <ModalButton onPress={handleSubmit(onSubmit)} label={'Update'} isBusy={isUpdating} />
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

export default SettingsEmailForm;
