import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import Template from './Template';

interface Props {
  siteUrl: string;
}

const WelcomeEmail = ({ siteUrl }: Props) => (
  <Template preview="Welcome to Rawstack">
    <Text style={heading}>Welcome to Rawstack</Text>
    <Text style={paragraph}>
      Your account has been created. Click the button below to get started.
    </Text>
    <Section style={btnContainer}>
      <Button style={button} href={siteUrl}>
        Get Started
      </Button>
    </Section>
    <Text style={hint}>
      If you didn't create this account, please disregard this email.
    </Text>
  </Template>
);

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

export default WelcomeEmail;
