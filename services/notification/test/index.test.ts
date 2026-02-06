import { EventBridgeEvent } from 'aws-lambda';

// Mock the providers and dependencies before importing handler
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ data: { id: 'mock-email-id' }, error: null }),
    },
  })),
}));

jest.mock('twilio', () => ({
  Twilio: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'mock-sms-id' }),
    },
  })),
}));

jest.mock('@react-email/components', () => ({
  render: jest.fn().mockResolvedValue('<html>Mocked email</html>'),
  Body: () => null,
  Container: () => null,
  Head: () => null,
  Hr: () => null,
  Html: () => null,
  Img: () => null,
  Preview: () => null,
  Section: () => null,
  Text: () => null,
  Button: () => null,
}));

describe('handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = {
      ...originalEnv,
      SITE_URL: 'https://example.com',
      WEBSITE_URL: 'https://example.com',
      RESEND_API_KEY: 'test-resend-api-key',
      EMAIL_FROM_ADDRESS: 'noreply@example.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const createMockEvent = (
    detailType: string,
    detail: Record<string, unknown>,
  ): EventBridgeEvent<string, Record<string, unknown>> => ({
    version: '0',
    id: 'test-event-id',
    'detail-type': detailType,
    source: 'api',
    account: '123456789',
    time: '2026-02-05T10:00:00Z',
    region: 'us-east-1',
    resources: [],
    detail,
  });

  it('should process user.user.wasCreated event', async () => {
    const { handler } = await import('../src/index');

    const event = createMockEvent('user.user.wasCreated', {
      data: {
        email: 'user@example.com',
      },
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body.success).toBe(true);
  });

  it('should process auth.token.wasCreated event for PASSWORD_RESET', async () => {
    const { handler } = await import('../src/index');

    const event = createMockEvent('auth.token.wasCreated', {
      data: {
        type: 'PASSWORD_RESET',
        email: 'user@example.com',
        token: 'reset-token-123',
      },
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body.success).toBe(true);
  });

  it('should process auth.token.wasCreated event for EMAIL_VERIFICATION', async () => {
    const { handler } = await import('../src/index');

    const event = createMockEvent('auth.token.wasCreated', {
      data: {
        type: 'EMAIL_VERIFICATION',
        email: 'user@example.com',
        token: 'verification-token-123',
      },
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body.success).toBe(true);
  });

  it('should throw error for unregistered event type', async () => {
    const { handler } = await import('../src/index');

    const event = createMockEvent('unknown.event.type', {
      data: {},
    });

    await expect(handler(event)).rejects.toThrow("No strategy registered for event type 'unknown.event.type'");
  });

  it('should include registered event types in error message', async () => {
    const { handler } = await import('../src/index');

    const event = createMockEvent('unknown.event.type', {
      data: {},
    });

    await expect(handler(event)).rejects.toThrow(
      /Registered types: \[.*user\.user\.wasCreated.*auth\.token\.wasCreated.*\]/,
    );
  });
});
