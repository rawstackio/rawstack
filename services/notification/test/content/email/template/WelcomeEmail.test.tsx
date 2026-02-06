import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import WelcomeEmail from '../../../../src/content/email/template/WelcomeEmail';

describe('WelcomeEmail', () => {
  const siteUrl = 'https://example.com';

  it('should render without errors', () => {
    const html = renderToStaticMarkup(<WelcomeEmail siteUrl={siteUrl} />);
    expect(html).toBeDefined();
    expect(typeof html).toBe('string');
  });

  it('should contain welcome heading', () => {
    const html = renderToStaticMarkup(<WelcomeEmail siteUrl={siteUrl} />);
    expect(html).toContain('Welcome to Rawstack');
  });

  it('should contain get started button with site URL', () => {
    const html = renderToStaticMarkup(<WelcomeEmail siteUrl={siteUrl} />);
    expect(html).toContain(siteUrl);
    expect(html).toContain('Get Started');
  });

  it('should contain account creation message', () => {
    const html = renderToStaticMarkup(<WelcomeEmail siteUrl={siteUrl} />);
    expect(html).toContain('Your account has been created');
  });

  it('should contain disclaimer about not creating account', () => {
    const html = renderToStaticMarkup(<WelcomeEmail siteUrl={siteUrl} />);
    expect(html).toContain('didn&#x27;t create this account');
  });
});
