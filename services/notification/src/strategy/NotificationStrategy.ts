import { EventBridgeEvent } from 'aws-lambda';
import { Channel, ChannelResult } from '../channel/Channel';

export interface NotificationContext {
  siteUrl: string;
  channels: {
    email?: Channel;
    sms?: Channel;
    push?: Channel;
  };
}

export interface NotificationResult {
  success: boolean;
  message?: string;
  channelResults: ChannelResult[];
}

export interface NotificationStrategy {
  /**
   * Returns the event type this strategy handles
   */
  readonly eventType: string;

  /**
   * Execute the notification strategy
   * Determines which channels to use based on event data and sends via each
   * @param event The EventBridge event
   * @param context The notification context containing channels and configuration
   */
  execute(event: EventBridgeEvent<string, unknown>, context: NotificationContext): Promise<NotificationResult>;
}
