import { TwilioSmsProvider, TwilioSmsProviderConfig } from '../../../src/provider/sms/TwilioSmsProvider';

// Mock the Twilio SDK
jest.mock('twilio', () => ({
  Twilio: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(),
    },
  })),
}));

describe('TwilioSmsProvider', () => {
  let provider: TwilioSmsProvider;
  let mockCreate: jest.Mock;
  const config: TwilioSmsProviderConfig = {
    accountSid: 'test-account-sid',
    authToken: 'test-auth-token',
    fromNumber: '+14155551234',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    provider = new TwilioSmsProvider(config);

    // Get reference to the mocked create function
    const { Twilio } = require('twilio');
    mockCreate = Twilio.mock.results[0].value.messages.create;
  });

  describe('name', () => {
    it('should return "twilio"', () => {
      expect(provider.name).toBe('twilio');
    });
  });

  describe('send', () => {
    it('should send SMS successfully', async () => {
      mockCreate.mockResolvedValue({
        sid: 'SM123456789',
      });

      const result = await provider.send({
        to: '+14155559999',
        text: 'Test SMS message',
      });

      expect(result).toEqual({
        success: true,
        messageId: 'SM123456789',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        to: '+14155559999',
        from: '+14155551234',
        body: 'Test SMS message',
      });
    });

    it('should use message from number when provided', async () => {
      mockCreate.mockResolvedValue({
        sid: 'SM123456789',
      });

      await provider.send({
        to: '+14155559999',
        from: '+14155550000',
        text: 'Test SMS message',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        to: '+14155559999',
        from: '+14155550000',
        body: 'Test SMS message',
      });
    });

    it('should use config fromNumber when message from is not provided', async () => {
      mockCreate.mockResolvedValue({
        sid: 'SM123456789',
      });

      await provider.send({
        to: '+14155559999',
        text: 'Test SMS message',
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '+14155551234',
        }),
      );
    });

    it('should handle thrown Error', async () => {
      mockCreate.mockRejectedValue(new Error('Invalid phone number'));

      const result = await provider.send({
        to: '+14155559999',
        text: 'Test SMS message',
      });

      expect(result).toEqual({
        success: false,
        error: 'Invalid phone number',
      });
    });

    it('should handle thrown non-Error', async () => {
      mockCreate.mockRejectedValue('Unknown failure');

      const result = await provider.send({
        to: '+14155559999',
        text: 'Test SMS message',
      });

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      });
    });
  });
});
