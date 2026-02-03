import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Template from '../../../../src/content/email/template/Template';

describe('Template', () => {
  it('should render without errors', () => {
    const html = renderToStaticMarkup(
      <Template>
        <p>Test content</p>
      </Template>,
    );
    expect(html).toBeDefined();
    expect(typeof html).toBe('string');
  });

  it('should contain children content', () => {
    const html = renderToStaticMarkup(
      <Template>
        <p>Custom email content here</p>
      </Template>,
    );
    expect(html).toContain('Custom email content here');
  });

  it('should use default preview text', () => {
    const html = renderToStaticMarkup(
      <Template>
        <p>Test</p>
      </Template>,
    );
    expect(html).toContain('Rawstack');
  });

  it('should use custom preview text when provided', () => {
    const html = renderToStaticMarkup(
      <Template preview="Custom Preview Text">
        <p>Test</p>
      </Template>,
    );
    expect(html).toContain('Custom Preview Text');
  });

  it('should contain footer text', () => {
    const html = renderToStaticMarkup(
      <Template>
        <p>Test</p>
      </Template>,
    );
    expect(html).toContain('Rawstack');
    expect(html).toContain('Your self-hosted application platform');
  });

  it('should contain logo image', () => {
    const html = renderToStaticMarkup(
      <Template>
        <p>Test</p>
      </Template>,
    );
    expect(html).toContain('rawstack-logo.png');
    expect(html).toContain('alt="Rawstack"');
  });
});
