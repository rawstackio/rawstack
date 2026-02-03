import { PushChannel } from '../../src/channel/PushChannel';
import { PushProviderInterface, PushProviderResult } from '../../src/provider/push/PushProviderInterface';

describe('PushChannel', () => {
  let mockProvider: jest.Mocked<PushProviderInterface>;
  let channel: PushChannel;

  beforeEach(() => {
    mockProvider = {
      name: 'mock-push',
      send: jest.fn(),
    };
    channel = new PushChannel(mockProvider);
  });

  describe('name', () => {
    it('should return "push"', () => {
      expect(channel.name).toBe('push');
    });
  });

  describe('send', () => {
    it('should send push notification successfully', async () => {
      const providerResult: PushProviderResult = {
        success: true,
        messageId: 'push-123',
      };
      mockProvider.send.mockResolvedValue(providerResult);

      const result = await channel.send({
        to: 'device-token-abc',
        subject: 'Test Title',
        text: 'Test push message',
      });

      expect(result).toEqual({
        channel: 'push',
        success: true,
        data: { messageId: 'push-123' },
        error: undefined,
      });

      expect(mockProvider.send).toHaveBeenCalledWith({
        to: 'device-token-abc',
        title: 'Test Title',
        body: 'Test push message',
      });
    });

    it('should send push notification without title', async () => {
      mockProvider.send.mockResolvedValue({ success: true, messageId: 'push-123' });

      await channel.send({
        to: 'device-token-abc',
        text: 'Test push message',
      });

      expect(mockProvider.send).toHaveBeenCalledWith({
        to: 'device-token-abc',
        title: undefined,
        body: 'Test push message',
      });
    });

    it('should return error from provider', async () => {
      const providerResult: PushProviderResult = {
        success: false,
        error: 'Push provider error',
      };
      mockProvider.send.mockResolvedValue(providerResult);

      const result = await channel.send({
        to: 'device-token-abc',
        text: 'Test push message',
      });

      expect(result).toEqual({
        channel: 'push',
        success: false,
        data: undefined,
        error: 'Push provider error',
      });
    });

    it('should return result without messageId when provider does not return one', async () => {
      mockProvider.send.mockResolvedValue({ success: true });

      const result = await channel.send({
        to: 'device-token-abc',
        text: 'Test push message',
      });

      expect(result.data).toBeUndefined();
    });
  });
});
