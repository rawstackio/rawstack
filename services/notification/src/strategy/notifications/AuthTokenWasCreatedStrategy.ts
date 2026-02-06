import { EventBridgeEvent } from 'aws-lambda';
import { render } from '@react-email/components';
import { NotificationContext, NotificationResult, NotificationStrategy } from '../NotificationStrategy';
import PasswordResetEmail from '../../content/email/template/PasswordResetEmail';
import EmailVerificationEmail from '../../content/email/template/EmailVerificationEmail';
import { ChannelResult } from '../../channel/Channel';

interface AuthTokenEventDetail {
  data: {
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
    email: string;
    token: string;
    phone?: string;
    pushToken?: string;
  };
}

export class AuthTokenWasCreatedStrategy implements NotificationStrategy {
  readonly eventType = 'auth.token.wasCreated';

  async execute(
    event: EventBridgeEvent<string, AuthTokenEventDetail>,
    context: NotificationContext,
  ): Promise<NotificationResult> {
    const { data } = event.detail;
    const channelResults: ChannelResult[] = [];

    switch (data.type) {
      case 'EMAIL_VERIFICATION':
        await this.sendEmailVerificationNotifications(data, context, channelResults);
        break;
      case 'PASSWORD_RESET':
        await this.sendPasswordResetNotifications(data, context, channelResults);
        break;
      default:
        throw new Error(`Unknown token type: ${data.type}`);
    }

    const allSucceeded = channelResults.every((r) => r.success);
    const notificationType = data.type === 'EMAIL_VERIFICATION' ? 'Email verification' : 'Password reset';

    return {
      success: allSucceeded,
      message: `${notificationType} notification sent via ${channelResults.length} channel(s)`,
      channelResults,
    };
  }

  private async sendPasswordResetNotifications(
    data: AuthTokenEventDetail['data'],
    context: NotificationContext,
    channelResults: ChannelResult[],
  ) {
    // Send email for password reset if email channel is configured
    if (context.channels.email) {
      const emailHtml = await render(
        PasswordResetEmail({ email: data.email, token: data.token, siteUrl: context.siteUrl }),
      );
      const emailResult = await context.channels.email.send({
        to: data.email,
        subject: 'Password reset requested',
        text: `A password reset was requested for your account. Visit: ${context.siteUrl}/reset-password?token=${data.token}`,
        html: emailHtml,
      });
      channelResults.push(emailResult);
    }

    // Send SMS notification if user has phone and sms channel is configured
    if (data.phone && context.channels.sms) {
      const smsResult = await context.channels.sms.send({
        to: data.phone,
        text: `Password reset requested for your account. Visit: ${context.siteUrl}/reset-password?token=${data.token}`,
      });
      channelResults.push(smsResult);
    }

    // Send push notification if user has app installed and push channel is configured
    if (data.pushToken && context.channels.push) {
      const pushResult = await context.channels.push.send({
        to: data.pushToken,
        text: 'Password reset requested. Check your email for the reset link.',
      });
      channelResults.push(pushResult);
    }
  }

  private async sendEmailVerificationNotifications(
    data: AuthTokenEventDetail['data'],
    context: NotificationContext,
    channelResults: ChannelResult[],
  ) {
    // Send email for verification if email channel is configured
    if (context.channels.email) {
      const emailHtml = await render(EmailVerificationEmail({ token: data.token, siteUrl: context.siteUrl }));
      const emailResult = await context.channels.email.send({
        to: data.email,
        subject: 'Please verify your email address',
        text: `Please verify your email address by visiting: ${context.siteUrl}/login?verification_token=${data.token}`,
        html: emailHtml,
      });
      channelResults.push(emailResult);
    }
  }
}
