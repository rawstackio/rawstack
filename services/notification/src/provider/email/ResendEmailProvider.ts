import { Resend } from 'resend';
import { EmailMessage, EmailProviderInterface, EmailProviderResult } from './EmailProviderInterface';

export class ResendEmailProvider implements EmailProviderInterface {
  readonly name = 'resend';
  private readonly resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async send(message: EmailMessage): Promise<EmailProviderResult> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
