export interface TokenVerifierInterface {
  verify<TPayload extends object = any>(token: string): Promise<TPayload>;
}
