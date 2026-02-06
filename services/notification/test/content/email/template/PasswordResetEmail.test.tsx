import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PasswordResetEmail from '../../../../src/content/email/template/PasswordResetEmail';

describe('PasswordResetEmail', () => {
  const props = {
    email: 'user@example.com',
    token: 'test-reset-token-123',
    siteUrl: 'https://example.com',
  };

  it('should render without errors', () => {
    const html = renderToStaticMarkup(<PasswordResetEmail {...props} />);
    expect(html).toBeDefined();
    expect(typeof html).toBe('string');
  });

  it('should contain password reset heading', () => {
    const html = renderToStaticMarkup(<PasswordResetEmail {...props} />);
    expect(html).toContain('Reset your password');
  });

  it('should contain reset button with correct URL', () => {
    const html = renderToStaticMarkup(<PasswordResetEmail {...props} />);
    expect(html).toContain(props.siteUrl);
    expect(html).toContain(props.token);
    expect(html).toContain('Reset Password');
  });

  it('should contain password reset request message', () => {
    const html = renderToStaticMarkup(<PasswordResetEmail {...props} />);
    expect(html).toContain('A password reset was requested');
  });

  it('should contain disclaimer about not requesting reset', () => {
    const html = renderToStaticMarkup(<PasswordResetEmail {...props} />);
    expect(html).toContain('didn&#x27;t request a password reset');
  });

  it('should use provided email in URL', () => {
    const customProps = { ...props, email: 'custom@test.com' };
    const html = renderToStaticMarkup(<PasswordResetEmail {...customProps} />);
    expect(html).toContain('custom@test.com');
  });

  it('should use provided token in URL', () => {
    const customProps = { ...props, token: 'custom-token-456' };
    const html = renderToStaticMarkup(<PasswordResetEmail {...customProps} />);
    expect(html).toContain('custom-token-456');
  });
});
