export type ChannelPayload = {
  to: string;
  subject?: string;
  text: string;
  html?: string;
};

export type ChannelResult = {
  channel: string;
  success: boolean;
  data?: unknown;
  error?: string;
};

export interface ChannelInterface {
  readonly name: string;

  send(payload: ChannelPayload): Promise<ChannelResult>;
}
