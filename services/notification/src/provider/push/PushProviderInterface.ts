export type PushMessage = {
  to: string; // Device token or topic
  title?: string;
  body: string;
  data?: Record<string, unknown>;
};

export type PushProviderResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export interface PushProviderInterface {
  readonly name: string;
  send(message: PushMessage): Promise<PushProviderResult>;
}
