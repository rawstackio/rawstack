import { Body, Container, Head, Hr, Html, Img, Preview, Section, Text } from '@react-email/components';
import * as React from 'react';

interface Props {
  preview?: string;
  children: React.ReactNode;
}

export const Template = ({ preview = 'Rawstack', children }: Props) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src={`${process.env.SITE_URL || ''}/static/rawstack-logo.png`}
            width="144"
            height="46"
            alt="Rawstack"
            style={logo}
          />
        </Section>
        <Section style={content}>
          {children}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Rawstack &mdash; Your self-hosted application platform.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default Template;

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 0',
  maxWidth: '480px',
};

const header = {
  textAlign: 'center' as const,
  padding: '0 0 24px',
};

const logo = {
  margin: '0 auto',
};

const content = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  border: '1px solid #e5e5e5',
  padding: '40px 32px',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
};

const footer = {
  color: '#787878',
  fontSize: '12px',
  textAlign: 'center' as const,
  lineHeight: '20px',
};
