import { AuthTokenWasCreatedStrategy } from '../../../src/strategy/notifications/AuthTokenWasCreatedStrategy';
import { NotificationContext } from '../../../src/strategy/NotificationStrategy';
import { ChannelInterface, ChannelResult } from '../../../src/channel/ChannelInterface';
import { EventBridgeEvent } from 'aws-lambda';

// Mock @react-email/components render function
jest.mock('@react-email/components', () => ({
  render: jest.fn().mockResolvedValue('<html>Mocked email HTML</html>'),
}));

interface AuthTokenEventDetail {
  data: {
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
    email: string;
    token: string;
    phone?: string;
    pushToken?: string;
  };
}

describe('AuthTokenWasCreatedStrategy', () => {
  let strategy: AuthTokenWasCreatedStrategy;
  let mockEmailChannel: jest.Mocked<ChannelInterface>;
  let mockSmsChannel: jest.Mocked<ChannelInterface>;
  let mockPushChannel: jest.Mocked<ChannelInterface>;
  let context: NotificationContext;

  const createMockEvent = (data: {
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
    email: string;
    token: string;
    phone?: string;
    pushToken?: string;
  }): EventBridgeEvent<string, AuthTokenEventDetail> => ({
    version: '0',
    id: 'test-event-id',
    'detail-type': 'auth.token.wasCreated',
    source: 'api',
    account: '123456789',
    time: '2026-02-05T10:00:00Z',
    region: 'us-east-1',
    resources: [],
    detail: { data },
  });

  beforeEach(() => {
    jest.clearAllMocks();

    strategy = new AuthTokenWasCreatedStrategy();

    mockEmailChannel = {
      name: 'email',
      send: jest.fn().mockResolvedValue({
        channel: 'email',
        success: true,
        data: { messageId: 'email-123' },
      } as ChannelResult),
    };

    mockSmsChannel = {
      name: 'sms',
      send: jest.fn().mockResolvedValue({
        channel: 'sms',
        success: true,
        data: { messageId: 'sms-123' },
      } as ChannelResult),
    };

    mockPushChannel = {
      name: 'push',
      send: jest.fn().mockResolvedValue({
        channel: 'push',
        success: true,
        data: { messageId: 'push-123' },
      } as ChannelResult),
    };

    context = {
      siteUrl: 'https://example.com',
      channels: {
        email: mockEmailChannel,
        sms: mockSmsChannel,
        push: mockPushChannel,
      },
    };
  });

  describe('eventType', () => {
    it('should return "auth.token.wasCreated"', () => {
      expect(strategy.eventType).toBe('auth.token.wasCreated');
    });
  });

  describe('execute - PASSWORD_RESET', () => {
    it('should send password reset email', async () => {
      const event = createMockEvent({
        type: 'PASSWORD_RESET',
        email: 'user@example.com',
        token: 'reset-token-123',
      });

      const result = await strategy.execute(event, context);

      expect(mockEmailChannel.send).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Password reset requested',
        text: 'A password reset was requested for your account. Visit: https://example.com/reset-password?token=reset-token-123',
        html: '<html>Mocked email HTML</html>',
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset notification sent via 1 channel(s)');
    });

    it('should send password reset SMS when user has phone', async () => {
      const event = createMockEvent({
        type: 'PASSWORD_RESET',
        email: 'user@example.com',
        token: 'reset-token-123',
        phone: '+14155551234',
      });

      const result = await strategy.execute(event, context);

      expect(mockSmsChannel.send).toHaveBeenCalledWith({
        to: '+14155551234',
        text: 'Password reset requested for your account. Visit: https://example.com/reset-password?token=reset-token-123',
      });
      expect(result.channelResults).toHaveLength(2);
    });

    it('should send password reset push notification when user has push token', async () => {
      const event = createMockEvent({
        type: 'PASSWORD_RESET',
        email: 'user@example.com',
        token: 'reset-token-123',
        pushToken: 'device-token-abc',
      });

      const result = await strategy.execute(event, context);

      expect(mockPushChannel.send).toHaveBeenCalledWith({
        to: 'device-token-abc',
        text: 'Password reset requested. Check your email for the reset link.',
      });
      expect(result.channelResults).toHaveLength(2);
    });

    it('should send all password reset notifications', async () => {
      const event = createMockEvent({
        type: 'PASSWORD_RESET',
        email: 'user@example.com',
        token: 'reset-token-123',
        phone: '+14155551234',
        pushToken: 'device-token-abc',
      });

      const result = await strategy.execute(event, context);

      expect(mockEmailChannel.send).toHaveBeenCalled();
      expect(mockSmsChannel.send).toHaveBeenCalled();
      expect(mockPushChannel.send).toHaveBeenCalled();
      expect(result.channelResults).toHaveLength(3);
    });
  });

  describe('execute - EMAIL_VERIFICATION', () => {
    it('should send email verification email', async () => {
      const event = createMockEvent({
        type: 'EMAIL_VERIFICATION',
        email: 'user@example.com',
        token: 'verification-token-123',
      });

      const result = await strategy.execute(event, context);

      expect(mockEmailChannel.send).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Please verify your email address',
        text: 'Please verify your email address by visiting: https://example.com/login?verification_token=verification-token-123',
        html: '<html>Mocked email HTML</html>',
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Email verification notification sent via 1 channel(s)');
    });

    it('should only send email for email verification (no SMS or push)', async () => {
      const event = createMockEvent({
        type: 'EMAIL_VERIFICATION',
        email: 'user@example.com',
        token: 'verification-token-123',
        phone: '+14155551234',
        pushToken: 'device-token-abc',
      });

      const result = await strategy.execute(event, context);

      expect(mockEmailChannel.send).toHaveBeenCalled();
      expect(mockSmsChannel.send).not.toHaveBeenCalled();
      expect(mockPushChannel.send).not.toHaveBeenCalled();
      expect(result.channelResults).toHaveLength(1);
    });
  });

  describe('execute - unknown token type', () => {
    it('should throw error for unknown token type', async () => {
      const event = createMockEvent({
        type: 'UNKNOWN_TYPE' as any,
        email: 'user@example.com',
        token: 'token-123',
      });

      await expect(strategy.execute(event, context)).rejects.toThrow('Unknown token type: UNKNOWN_TYPE');
    });
  });

  describe('execute - channel not configured', () => {
    it('should skip email when email channel is not configured', async () => {
      context.channels.email = undefined;
      const event = createMockEvent({
        type: 'PASSWORD_RESET',
        email: 'user@example.com',
        token: 'reset-token-123',
        phone: '+14155551234',
      });

      const result = await strategy.execute(event, context);

      expect(result.channelResults).toHaveLength(1);
      expect(result.channelResults[0].channel).toBe('sms');
    });

    it('should return empty results for email verification when email channel not configured', async () => {
      context.channels.email = undefined;
      const event = createMockEvent({
        type: 'EMAIL_VERIFICATION',
        email: 'user@example.com',
        token: 'verification-token-123',
      });

      const result = await strategy.execute(event, context);

      expect(result.channelResults).toHaveLength(0);
      expect(result.success).toBe(true);
    });
  });

  describe('execute - channel failure', () => {
    it('should return success false when email channel fails', async () => {
      mockEmailChannel.send.mockResolvedValue({
        channel: 'email',
        success: false,
        error: 'Email failed',
      });

      const event = createMockEvent({
        type: 'PASSWORD_RESET',
        email: 'user@example.com',
        token: 'reset-token-123',
      });

      const result = await strategy.execute(event, context);

      expect(result.success).toBe(false);
      expect(result.channelResults[0].error).toBe('Email failed');
    });

    it('should return success false when any channel fails', async () => {
      mockSmsChannel.send.mockResolvedValue({
        channel: 'sms',
        success: false,
        error: 'SMS failed',
      });

      const event = createMockEvent({
        type: 'PASSWORD_RESET',
        email: 'user@example.com',
        token: 'reset-token-123',
        phone: '+14155551234',
      });

      const result = await strategy.execute(event, context);

      expect(result.success).toBe(false);
    });
  });
});
