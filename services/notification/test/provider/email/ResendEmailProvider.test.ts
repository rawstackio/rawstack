import { ResendEmailProvider } from '../../../src/provider/email/ResendEmailProvider';

// Mock the Resend SDK
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

describe('ResendEmailProvider', () => {
  let provider: ResendEmailProvider;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    provider = new ResendEmailProvider('test-api-key');

    // Get reference to the mocked send function
    const { Resend } = require('resend');
    mockSend = Resend.mock.results[0].value.emails.send;
  });

  describe('name', () => {
    it('should return "resend"', () => {
      expect(provider.name).toBe('resend');
    });
  });

  describe('send', () => {
    it('should send email successfully', async () => {
      mockSend.mockResolvedValue({
        data: { id: 'email-id-123' },
        error: null,
      });

      const result = await provider.send({
        to: 'user@example.com',
        from: 'noreply@example.com',
        subject: 'Test Subject',
        text: 'Test content',
        html: '<p>Test content</p>',
      });

      expect(result).toEqual({
        success: true,
        messageId: 'email-id-123',
      });

      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'user@example.com',
        subject: 'Test Subject',
        text: 'Test content',
        html: '<p>Test content</p>',
      });
    });

    it('should send email without html', async () => {
      mockSend.mockResolvedValue({
        data: { id: 'email-id-123' },
        error: null,
      });

      const result = await provider.send({
        to: 'user@example.com',
        from: 'noreply@example.com',
        subject: 'Test Subject',
        text: 'Test content',
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: undefined,
        }),
      );
    });

    it('should return error when Resend API returns error', async () => {
      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'API rate limit exceeded' },
      });

      const result = await provider.send({
        to: 'user@example.com',
        from: 'noreply@example.com',
        subject: 'Test Subject',
        text: 'Test content',
      });

      expect(result).toEqual({
        success: false,
        error: 'API rate limit exceeded',
      });
    });

    it('should handle thrown Error', async () => {
      mockSend.mockRejectedValue(new Error('Network error'));

      const result = await provider.send({
        to: 'user@example.com',
        from: 'noreply@example.com',
        subject: 'Test Subject',
        text: 'Test content',
      });

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should handle thrown non-Error', async () => {
      mockSend.mockRejectedValue('Unknown failure');

      const result = await provider.send({
        to: 'user@example.com',
        from: 'noreply@example.com',
        subject: 'Test Subject',
        text: 'Test content',
      });

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      });
    });
  });
});
