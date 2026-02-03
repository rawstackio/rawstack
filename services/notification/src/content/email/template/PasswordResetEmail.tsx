import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import Template from './Template';

interface Props {
  email: string;
  token: string;
  siteUrl: string;
}

const PasswordResetEmail = ({ email, token, siteUrl }: Props) => {
  const passwordResetUrl = `${siteUrl}/login?email=${email}&password_reset_token=${token}`;

  return (
    <Template preview="Reset your password">
      <Text style={heading}>Reset your password</Text>
      <Text style={paragraph}>
        A password reset was requested for your account. Click the button below to choose a new password.
      </Text>
      <Section style={btnContainer}>
        <Button style={button} href={passwordResetUrl}>
          Reset Password
        </Button>
      </Section>
      <Text style={hint}>
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </Text>
    </Template>
  );
};

const heading = {
  fontSize: '20px',
  fontWeight: '600' as const,
  color: '#1f1f1f',
  lineHeight: '28px',
  margin: '0 0 16px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#1f1f1f',
  margin: '0 0 24px',
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const button = {
  backgroundColor: '#2b2b2b',
  borderRadius: '8px',
  color: '#fafafa',
  fontSize: '14px',
  fontWeight: '500' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '10px 24px',
};

const hint = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#787878',
  margin: '0',
};

export default PasswordResetEmail;
