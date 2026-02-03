import { EventBridgeEvent } from 'aws-lambda';
import { render } from '@react-email/components';
import { NotificationContext, NotificationResult, NotificationStrategy } from '../NotificationStrategy';
import WelcomeEmail from '../../content/email/template/WelcomeEmail';
import { ChannelResult } from '../../channel/Channel';

interface UserWasCreatedEventDetail {
  data: {
    email: string;
    phone?: string;
    pushToken?: string;
  };
}

export class UserWasCreatedStrategy implements NotificationStrategy {
  readonly eventType = 'user.user.wasCreated';

  async execute(
    event: EventBridgeEvent<string, UserWasCreatedEventDetail>,
    context: NotificationContext,
  ): Promise<NotificationResult> {
    const { data: user } = event.detail;
    const channelResults: ChannelResult[] = [];

    // Send email for welcome if email channel is configured
    if (context.channels.email) {
      const emailHtml = await render(WelcomeEmail({ siteUrl: context.siteUrl }));
      const emailResult = await context.channels.email.send({
        to: user.email,
        subject: 'Welcome to RawStack!',
        text: 'Welcome to RawStack!',
        html: emailHtml,
      });
      channelResults.push(emailResult);
    }

    // Send SMS if user provided phone number and sms channel is configured
    if (user.phone && context.channels.sms) {
      const smsResult = await context.channels.sms.send({
        to: user.phone,
        text: 'Welcome to RawStack! Your account has been created.',
      });
      channelResults.push(smsResult);
    }

    // Send push notification if user has a registered device and push channel is configured
    if (user.pushToken && context.channels.push) {
      const pushResult = await context.channels.push.send({
        to: user.pushToken,
        text: 'Welcome to RawStack! 🎉',
      });
      channelResults.push(pushResult);
    }

    const allSucceeded = channelResults.every((r) => r.success);

    return {
      success: allSucceeded,
      message: `Welcome notification sent via ${channelResults.length} channel(s)`,
      channelResults,
    };
  }
}
