import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import EmailVerificationEmail from '../../../../src/content/email/template/EmailVerificationEmail';

describe('EmailVerificationEmail', () => {
  const props = {
    token: 'test-verification-token-123',
    siteUrl: 'https://example.com',
  };

  it('should render without errors', () => {
    const html = renderToStaticMarkup(<EmailVerificationEmail {...props} />);
    expect(html).toBeDefined();
    expect(typeof html).toBe('string');
  });

  it('should contain verify email heading', () => {
    const html = renderToStaticMarkup(<EmailVerificationEmail {...props} />);
    expect(html).toContain('Verify your email');
  });

  it('should contain verify button with correct URL', () => {
    const html = renderToStaticMarkup(<EmailVerificationEmail {...props} />);
    expect(html).toContain(props.siteUrl);
    expect(html).toContain(props.token);
    expect(html).toContain('Verify Email');
  });

  it('should contain signup thank you message', () => {
    const html = renderToStaticMarkup(<EmailVerificationEmail {...props} />);
    expect(html).toContain('Thanks for signing up');
  });

  it('should contain disclaimer about not creating account', () => {
    const html = renderToStaticMarkup(<EmailVerificationEmail {...props} />);
    expect(html).toContain('didn&#x27;t create an account');
  });

  it('should use provided token in URL', () => {
    const customProps = { ...props, token: 'custom-verification-token-456' };
    const html = renderToStaticMarkup(<EmailVerificationEmail {...customProps} />);
    expect(html).toContain('custom-verification-token-456');
  });

  it('should use provided siteUrl in URL', () => {
    const customProps = { ...props, siteUrl: 'https://custom-site.com' };
    const html = renderToStaticMarkup(<EmailVerificationEmail {...customProps} />);
    expect(html).toContain('https://custom-site.com/login');
  });
});
