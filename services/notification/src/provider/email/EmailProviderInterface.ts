export type EmailMessage = {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
}

export type EmailProviderResult = {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailProviderInterface {
  readonly name: string;

  send(message: EmailMessage): Promise<EmailProviderResult>;
}
