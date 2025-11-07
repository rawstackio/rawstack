import React, { useState } from 'react';
import Screen from '../components/Template/Screen';
import SignupForm from '../components/Auth/SignupForm';
import styled from 'styled-components/native';
import UserModel from '../lib/model/UserModel';
import { useAuth, UserCredentials } from '../lib/context/AuthContext';
import LoginForm from '../components/Auth/LoginForm';
import PasswordResetRequestForm from '../components/Auth/PasswordResetRequestForm';
import { AuthenticationError } from '../lib/api/exception/errors';
import Banner from '../components/Banner/Banner';

type displayForm = 'login' | 'signup' | 'password';

const AuthScreen = () => {
  const { login } = useAuth();
  const [showForm, setShowForm] = useState<displayForm>('login');
  const [isBusy, setIsBusy] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const onSwitchForms = () => {
    setFormErrors([]);
    switch (showForm) {
      case 'password':
      case 'signup':
        setShowForm('login');
        break;
      default:
        setShowForm('signup');
    }
  };

  const onLogin = async (credentials: UserCredentials) => {
    setIsBusy(true);
    try {
      await login(credentials);
      setIsBusy(false);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        setFormErrors([error.message]);
      }
      setIsBusy(false);
    }
  };

  const onSignupSuccess = async (
    user: UserModel,
    credentials: UserCredentials,
  ) => {
    setIsBusy(true);
    await login(credentials, user);
    setIsBusy(false);
  };

  const headingText = () => {
    switch (showForm) {
      case 'password':
        return 'Reset Password';
      case 'signup':
        return 'Signup';
      default:
        return 'Login';
    }
  };

  const introText = () => {
    switch (showForm) {
      case 'password':
        return (
          <RegisterText>
            {
              'A password rest link will be sent to your email if it exists in our system.'
            }{' '}
            <RegisterTextLink>{'Login'}</RegisterTextLink>
          </RegisterText>
        );
      case 'signup':
        return (
          <RegisterText>
            {'Already registered?'}{' '}
            <RegisterTextLink>{'Login'}</RegisterTextLink>
          </RegisterText>
        );
      default:
        return (
          <RegisterText>
            {'Not registered yet?'}{' '}
            <RegisterTextLink>{'Create an Account'}</RegisterTextLink>
          </RegisterText>
        );
    }
  };

  const showPasswordResetForm = () => {
    setShowForm('password');
  };

  const renderForm = () => {
    switch (showForm) {
      case 'password':
        return (
          <PasswordResetRequestForm isBusy={isBusy} formErrors={formErrors} />
        );
      case 'signup':
        return (
          <SignupForm
            onUserCreated={onSignupSuccess}
            isBusy={isBusy}
            formErrors={formErrors}
          />
        );
      default:
        return (
          <>
            <LoginForm
              onLogin={onLogin}
              isBusy={isBusy}
              formErrors={formErrors}
            />
            <PasswordResetLink onPress={showPasswordResetForm}>
              <PasswordRestText onPress={showPasswordResetForm}>
                Forgot password?
              </PasswordRestText>
            </PasswordResetLink>
          </>
        );
    }
  };

  return (
    <Screen hideHeader={true} edges={['bottom']}>
      <Banner />
      <ModalContainer>
        <ContentContainer>
          <Heading>{headingText()}</Heading>
          <SignupButton onPress={onSwitchForms}>{introText()}</SignupButton>
          <Content>{renderForm()}</Content>
        </ContentContainer>
      </ModalContainer>
    </Screen>
  );
};

const Heading = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  justify-content: center;
  text-align: left;
  color: ${p => p.theme.text};
`;

const Content = styled.View`
  margin: 14px 0 0;
`;

const SignupButton = styled.Pressable`
  padding: 8px 0 0;
`;

const RegisterText = styled.Text`
  color: ${p => p.theme.text};
  font-size: 14px;
`;

const PasswordRestText = styled(RegisterText)`
  font-weight: bold;
`;

const RegisterTextLink = styled(RegisterText)`
  color: ${p => p.theme.primary};
`;

const ModalContainer = styled.KeyboardAvoidingView.attrs({
  behavior: 'padding',
})`
  justify-content: flex-end;
  align-items: center;
`;

const ContentContainer = styled.View`
  background: ${p => p.theme.background};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  width: 100%;
  padding: 24px 24px 20px;
  margin-top: -48px;
`;

const PasswordResetLink = styled.Pressable`
  padding: 14px 0 0;
  flex-direction: row;
  margin: 0 auto;
`;

export default AuthScreen;
