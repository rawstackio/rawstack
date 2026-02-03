import { SmsChannel, SmsChannelConfig } from '../../src/channel/SmsChannel';
import { SmsProviderInterface, SmsProviderResult } from '../../src/provider/sms/SmsProviderInterface';
import { ValidationException } from '../../src/exception/ValidationException';

describe('SmsChannel', () => {
  let mockProvider: jest.Mocked<SmsProviderInterface>;
  let config: SmsChannelConfig;
  let channel: SmsChannel;

  beforeEach(() => {
    mockProvider = {
      name: 'mock-sms',
      send: jest.fn(),
    };
    config = {
      fromNumber: '+14155551234',
    };
    channel = new SmsChannel(mockProvider, config);
  });

  describe('name', () => {
    it('should return "sms"', () => {
      expect(channel.name).toBe('sms');
    });
  });

  describe('send', () => {
    it('should send SMS successfully', async () => {
      const providerResult: SmsProviderResult = {
        success: true,
        messageId: 'sms-123',
      };
      mockProvider.send.mockResolvedValue(providerResult);

      const result = await channel.send({
        to: '+14155559999',
        text: 'Test SMS message',
      });

      expect(result).toEqual({
        channel: 'sms',
        success: true,
        data: { messageId: 'sms-123' },
        error: undefined,
      });

      expect(mockProvider.send).toHaveBeenCalledWith({
        to: '+14155559999',
        from: '+14155551234',
        text: 'Test SMS message',
      });
    });

    it('should work without fromNumber in config', async () => {
      const noFromChannel = new SmsChannel(mockProvider, {});
      mockProvider.send.mockResolvedValue({ success: true, messageId: 'sms-123' });

      await noFromChannel.send({
        to: '+14155559999',
        text: 'Test SMS message',
      });

      expect(mockProvider.send).toHaveBeenCalledWith({
        to: '+14155559999',
        from: undefined,
        text: 'Test SMS message',
      });
    });

    it('should return error from provider', async () => {
      const providerResult: SmsProviderResult = {
        success: false,
        error: 'SMS provider error',
      };
      mockProvider.send.mockResolvedValue(providerResult);

      const result = await channel.send({
        to: '+14155559999',
        text: 'Test SMS message',
      });

      expect(result).toEqual({
        channel: 'sms',
        success: false,
        data: undefined,
        error: 'SMS provider error',
      });
    });

    it('should throw ValidationException for invalid phone number', async () => {
      await expect(
        channel.send({
          to: 'invalid-phone',
          text: 'Test SMS message',
        }),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when text is empty', async () => {
      await expect(
        channel.send({
          to: '+14155559999',
          text: '',
        }),
      ).rejects.toThrow(ValidationException);
    });

    it('should return result without messageId when provider does not return one', async () => {
      mockProvider.send.mockResolvedValue({ success: true });

      const result = await channel.send({
        to: '+14155559999',
        text: 'Test SMS message',
      });

      expect(result.data).toBeUndefined();
    });
  });
});
