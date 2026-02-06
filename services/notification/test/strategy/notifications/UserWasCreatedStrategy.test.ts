import { UserWasCreatedStrategy } from '../../../src/strategy/notifications/UserWasCreatedStrategy';
import { NotificationContext } from '../../../src/strategy/NotificationStrategy';
import { ChannelInterface, ChannelResult } from '../../../src/channel/ChannelInterface';
import { EventBridgeEvent } from 'aws-lambda';

// Mock @react-email/components render function
jest.mock('@react-email/components', () => ({
  render: jest.fn().mockResolvedValue('<html>Mocked email HTML</html>'),
}));

interface UserWasCreatedEventDetail {
  data: {
    email: string;
    phone?: string;
    pushToken?: string;
  };
}

describe('UserWasCreatedStrategy', () => {
  let strategy: UserWasCreatedStrategy;
  let mockEmailChannel: jest.Mocked<ChannelInterface>;
  let mockSmsChannel: jest.Mocked<ChannelInterface>;
  let mockPushChannel: jest.Mocked<ChannelInterface>;
  let context: NotificationContext;

  const createMockEvent = (data: {
    email: string;
    phone?: string;
    pushToken?: string;
  }): EventBridgeEvent<string, UserWasCreatedEventDetail> => ({
    version: '0',
    id: 'test-event-id',
    'detail-type': 'user.user.wasCreated',
    source: 'api',
    account: '123456789',
    time: '2026-02-05T10:00:00Z',
    region: 'us-east-1',
    resources: [],
    detail: { data },
  });

  beforeEach(() => {
    jest.clearAllMocks();

    strategy = new UserWasCreatedStrategy();

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
    it('should return "user.user.wasCreated"', () => {
      expect(strategy.eventType).toBe('user.user.wasCreated');
    });
  });

  describe('execute', () => {
    it('should send email notification for new user', async () => {
      const event = createMockEvent({ email: 'user@example.com' });

      const result = await strategy.execute(event, context);

      expect(mockEmailChannel.send).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Welcome to RawStack!',
        text: 'Welcome to RawStack!',
        html: '<html>Mocked email HTML</html>',
      });
      expect(result.success).toBe(true);
      expect(result.channelResults).toHaveLength(1);
    });

    it('should send SMS notification when user has phone number', async () => {
      const event = createMockEvent({
        email: 'user@example.com',
        phone: '+14155551234',
      });

      const result = await strategy.execute(event, context);

      expect(mockSmsChannel.send).toHaveBeenCalledWith({
        to: '+14155551234',
        text: 'Welcome to RawStack! Your account has been created.',
      });
      expect(result.channelResults).toHaveLength(2);
    });

    it('should send push notification when user has push token', async () => {
      const event = createMockEvent({
        email: 'user@example.com',
        pushToken: 'device-token-abc',
      });

      const result = await strategy.execute(event, context);

      expect(mockPushChannel.send).toHaveBeenCalledWith({
        to: 'device-token-abc',
        text: 'Welcome to RawStack! 🎉',
      });
      expect(result.channelResults).toHaveLength(2);
    });

    it('should send all notifications when user has email, phone, and push token', async () => {
      const event = createMockEvent({
        email: 'user@example.com',
        phone: '+14155551234',
        pushToken: 'device-token-abc',
      });

      const result = await strategy.execute(event, context);

      expect(mockEmailChannel.send).toHaveBeenCalled();
      expect(mockSmsChannel.send).toHaveBeenCalled();
      expect(mockPushChannel.send).toHaveBeenCalled();
      expect(result.channelResults).toHaveLength(3);
      expect(result.message).toBe('Welcome notification sent via 3 channel(s)');
    });

    it('should skip SMS when sms channel is not configured', async () => {
      context.channels.sms = undefined;
      const event = createMockEvent({
        email: 'user@example.com',
        phone: '+14155551234',
      });

      const result = await strategy.execute(event, context);

      expect(result.channelResults).toHaveLength(1);
      expect(result.channelResults[0].channel).toBe('email');
    });

    it('should skip push when push channel is not configured', async () => {
      context.channels.push = undefined;
      const event = createMockEvent({
        email: 'user@example.com',
        pushToken: 'device-token-abc',
      });

      const result = await strategy.execute(event, context);

      expect(result.channelResults).toHaveLength(1);
      expect(result.channelResults[0].channel).toBe('email');
    });

    it('should skip email when email channel is not configured', async () => {
      context.channels.email = undefined;
      const event = createMockEvent({
        email: 'user@example.com',
        phone: '+14155551234',
      });

      const result = await strategy.execute(event, context);

      expect(result.channelResults).toHaveLength(1);
      expect(result.channelResults[0].channel).toBe('sms');
    });

    it('should return success false when any channel fails', async () => {
      mockSmsChannel.send.mockResolvedValue({
        channel: 'sms',
        success: false,
        error: 'SMS failed',
      });

      const event = createMockEvent({
        email: 'user@example.com',
        phone: '+14155551234',
      });

      const result = await strategy.execute(event, context);

      expect(result.success).toBe(false);
      expect(result.channelResults).toHaveLength(2);
    });

    it('should return empty results when no channels configured', async () => {
      context.channels = {};
      const event = createMockEvent({ email: 'user@example.com' });

      const result = await strategy.execute(event, context);

      expect(result.channelResults).toHaveLength(0);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Welcome notification sent via 0 channel(s)');
    });
  });
});
