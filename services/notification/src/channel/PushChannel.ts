import { ChannelInterface, ChannelPayload, ChannelResult } from './ChannelInterface';
import { PushProviderInterface } from '../provider/push/PushProviderInterface';

export class PushChannel implements ChannelInterface {
  readonly name = 'push';

  constructor(private readonly provider: PushProviderInterface) {}

  async send(payload: ChannelPayload): Promise<ChannelResult> {
    const result = await this.provider.send({
      to: payload.to,
      title: payload.subject,
      body: payload.text,
    });

    return {
      channel: this.name,
      success: result.success,
      data: result.messageId ? { messageId: result.messageId } : undefined,
      error: result.error,
    };
  }
}
