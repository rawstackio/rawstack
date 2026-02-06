import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import Template from './Template';

interface Props {
  token: string;
  siteUrl: string;
}

const EmailVerificationEmail = ({ token, siteUrl }: Props) => {
  const verificationUrl = `${siteUrl}/login?verification_token=${token}`;

  return (
    <Template preview="Verify your email address">
      <Text style={heading}>Verify your email</Text>
      <Text style={paragraph}>
        Thanks for signing up. Please verify your email address by clicking the button below.
      </Text>
      <Section style={btnContainer}>
        <Button style={button} href={verificationUrl}>
          Verify Email
        </Button>
      </Section>
      <Text style={hint}>
        If you didn't create an account, you can safely ignore this email.
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

export default EmailVerificationEmail;
