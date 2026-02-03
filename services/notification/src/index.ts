import { EventBridgeEvent } from 'aws-lambda';
import { UserWasCreatedStrategy } from './strategy/notifications/UserWasCreatedStrategy';
import { AuthTokenWasCreatedStrategy } from './strategy/notifications/AuthTokenWasCreatedStrategy';
import { NotificationContext } from './strategy/NotificationStrategy';
import { NotificationRegistry } from './strategy/NotificationRegistry';
import { EmailChannel } from './channel/EmailChannel';
import { ResendEmailProvider } from './provider/email/ResendEmailProvider';
import { SmsChannel } from './channel/SmsChannel';
import { TwilioSmsProvider } from './provider/sms/TwilioSmsProvider';

/**
 * Initialize the notification registry with all available strategies
 */
const createRegistry = (): NotificationRegistry => {
  const registry = new NotificationRegistry();

  registry.registerAll([new UserWasCreatedStrategy(), new AuthTokenWasCreatedStrategy()]);

  return registry;
};

/**
 * Initialize channels with their providers based on available configuration
 * Channels are only created when their required config is present
 */
const createChannels = () => {
  const channels: NotificationContext['channels'] = {};

  channels.email = new EmailChannel(new ResendEmailProvider(process.env.RESEND_API_KEY!), {
    fromAddress: process.env.EMAIL_FROM_ADDRESS!,
    overrideRecipientEmail: process.env.OVERRIDE_RECIPIENT_EMAIL,
  });

  // SMS channel - requires Twilio configuration
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    channels.sms = new SmsChannel(
      new TwilioSmsProvider({
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER,
      }),
      { fromNumber: process.env.TWILIO_FROM_NUMBER },
    );
  }

  // Push channel - requires push provider configuration (placeholder for now)
  // channels.push = new PushChannel(new PushProvider());

  return channels;
};

// Initialize registry and channels once at cold start
const registry = createRegistry();
const channels = createChannels();

/**
 * Lambda handler for processing notification events
 * @param event The EventBridge event containing notification details
 */
export const handler = async (event: EventBridgeEvent<string, unknown>) => {
  console.log('Event:', JSON.stringify(event));

  // Early exit if no channels are configured
  const configuredChannels = Object.keys(channels);
  if (configuredChannels.length === 0) {
    console.warn('No notification channels configured. Exiting early.');
    return {
      statusCode: 200,
      body: {
        success: false,
        message: 'No notification channels configured',
        channelResults: [],
      },
    };
  }

  const eventType = event['detail-type'];

  const context: NotificationContext = {
    siteUrl: process.env.WEBSITE_URL!,
    channels,
  };

  const strategy = registry.get(eventType);

  if (!strategy) {
    const registeredTypes = registry.getRegisteredEventTypes().join(', ');
    throw new Error(`No strategy registered for event type '${eventType}'. Registered types: [${registeredTypes}]`);
  }

  try {
    const result = await strategy.execute(event, context);

    console.log(`Notification processed for event type: ${eventType}`);
    console.log(`Channels used: ${result.channelResults.map((r) => r.channel).join(', ')}`);

    return {
      statusCode: 200,
      body: result,
    };
  } catch (error) {
    console.error(`Failed to process notification for event type '${eventType}':`, error);
    throw error;
  }
};
