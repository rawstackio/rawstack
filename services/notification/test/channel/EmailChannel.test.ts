import { EmailChannel, EmailChannelConfig } from '../../src/channel/EmailChannel';
import { EmailProviderInterface, EmailProviderResult } from '../../src/provider/email/EmailProviderInterface';
import { ValidationException } from '../../src/exception/ValidationException';

describe('EmailChannel', () => {
  let mockProvider: jest.Mocked<EmailProviderInterface>;
  let config: EmailChannelConfig;
  let channel: EmailChannel;

  beforeEach(() => {
    mockProvider = {
      name: 'mock-email',
      send: jest.fn(),
    };
    config = {
      fromAddress: 'noreply@example.com',
    };
    channel = new EmailChannel(mockProvider, config);
  });

  describe('name', () => {
    it('should return "email"', () => {
      expect(channel.name).toBe('email');
    });
  });

  describe('send', () => {
    it('should send email successfully', async () => {
      const providerResult: EmailProviderResult = {
        success: true,
        messageId: 'msg-123',
      };
      mockProvider.send.mockResolvedValue(providerResult);

      const result = await channel.send({
        to: 'user@example.com',
        subject: 'Test Subject',
        text: 'Test content',
        html: '<p>Test content</p>',
      });

      expect(result).toEqual({
        channel: 'email',
        success: true,
        data: { messageId: 'msg-123' },
        error: undefined,
      });

      expect(mockProvider.send).toHaveBeenCalledWith({
        to: 'user@example.com',
        from: 'noreply@example.com',
        subject: 'Test Subject',
        text: 'Test content',
        html: '<p>Test content</p>',
      });
    });

    it('should use default subject when not provided', async () => {
      mockProvider.send.mockResolvedValue({ success: true, messageId: 'msg-123' });

      await channel.send({
        to: 'user@example.com',
        text: 'Test content',
      });

      expect(mockProvider.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Notification',
        }),
      );
    });

    it('should override recipient email when configured', async () => {
      const overrideConfig: EmailChannelConfig = {
        fromAddress: 'noreply@example.com',
        overrideRecipientEmail: 'test@override.com',
      };
      const overrideChannel = new EmailChannel(mockProvider, overrideConfig);
      mockProvider.send.mockResolvedValue({ success: true, messageId: 'msg-123' });

      await overrideChannel.send({
        to: 'user@example.com',
        text: 'Test content',
      });

      expect(mockProvider.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@override.com',
        }),
      );
    });

    it('should return error from provider', async () => {
      const providerResult: EmailProviderResult = {
        success: false,
        error: 'Provider error',
      };
      mockProvider.send.mockResolvedValue(providerResult);

      const result = await channel.send({
        to: 'user@example.com',
        text: 'Test content',
      });

      expect(result).toEqual({
        channel: 'email',
        success: false,
        data: undefined,
        error: 'Provider error',
      });
    });

    it('should throw ValidationException for invalid recipient email', async () => {
      await expect(
        channel.send({
          to: 'invalid-email',
          text: 'Test content',
        }),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException for invalid from address', async () => {
      const invalidConfig: EmailChannelConfig = {
        fromAddress: 'invalid-from',
      };
      const invalidChannel = new EmailChannel(mockProvider, invalidConfig);

      await expect(
        invalidChannel.send({
          to: 'user@example.com',
          text: 'Test content',
        }),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when text is empty', async () => {
      await expect(
        channel.send({
          to: 'user@example.com',
          text: '',
        }),
      ).rejects.toThrow(ValidationException);
    });
  });
});
