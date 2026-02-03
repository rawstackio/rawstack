import { Twilio } from 'twilio';
import { SmsMessage, SmsProviderInterface, SmsProviderResult } from './SmsProviderInterface';

export interface TwilioSmsProviderConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export class TwilioSmsProvider implements SmsProviderInterface {
  readonly name = 'twilio';
  private readonly client: Twilio;
  private readonly fromNumber: string;

  constructor(config: TwilioSmsProviderConfig) {
    this.client = new Twilio(config.accountSid, config.authToken);
    this.fromNumber = config.fromNumber;
  }

  async send(message: SmsMessage): Promise<SmsProviderResult> {
    try {
      const result = await this.client.messages.create({
        to: message.to,
        from: message.from || this.fromNumber,
        body: message.text,
      });

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
