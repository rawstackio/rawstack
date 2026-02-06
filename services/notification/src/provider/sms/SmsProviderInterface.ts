export type SmsMessage = {
  to: string;
  from?: string;
  text: string;
};

export type SmsProviderResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export interface SmsProviderInterface {
  readonly name: string;

  send(message: SmsMessage): Promise<SmsProviderResult>;
}
