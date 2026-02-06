import { ChannelInterface, ChannelPayload, ChannelResult } from './ChannelInterface';
import { SmsProviderInterface } from '../provider/sms/SmsProviderInterface';
import { Validator } from '../validation/Validator';

export interface SmsChannelConfig {
  fromNumber?: string;
}

/**
 * SMS Channel - sends notifications via SMS
 */
export class SmsChannel implements ChannelInterface {
  readonly name = 'sms';

  constructor(
    private readonly provider: SmsProviderInterface,
    private readonly config: SmsChannelConfig = {},
  ) {}

  async send(payload: ChannelPayload): Promise<ChannelResult> {
    Validator.phone(payload.to, 'recipient');
    Validator.required(payload.text, 'text');

    const result = await this.provider.send({
      to: payload.to,
      from: this.config.fromNumber,
      text: payload.text,
    });

    return {
      channel: this.name,
      success: result.success,
      data: result.messageId ? { messageId: result.messageId } : undefined,
      error: result.error,
    };
  }
}
