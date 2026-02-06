import { EmailProviderInterface } from '../provider/email/EmailProviderInterface';
import { ChannelInterface, ChannelPayload, ChannelResult } from './ChannelInterface';
import { Validator } from '../validation/Validator';

export interface EmailChannelConfig {
  fromAddress: string;
  overrideRecipientEmail?: string;
}

export class EmailChannel implements ChannelInterface {
  readonly name = 'email';

  constructor(
    private readonly provider: EmailProviderInterface,
    private readonly config: EmailChannelConfig,
  ) {}

  async send(payload: ChannelPayload): Promise<ChannelResult> {
    const recipient = this.config.overrideRecipientEmail ?? payload.to;

    Validator.email(recipient, 'recipient');
    Validator.email(this.config.fromAddress, 'fromAddress');
    Validator.required(payload.text, 'text');

    const result = await this.provider.send({
      to: recipient,
      from: this.config.fromAddress,
      subject: payload.subject || 'Notification',
      text: payload.text,
      html: payload.html,
    });

    return {
      channel: this.name,
      success: result.success,
      data: result.messageId ? { messageId: result.messageId } : undefined,
      error: result.error,
    };
  }
}
