import { CreateTokenRequest } from '~/auth/infrastructure/controller/token/request/create-token.request';

export class CreateTokenCommand {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password?: string,
    public readonly refreshToken?: string,
    public readonly role?: string,
    public readonly invalidateTokens?: boolean,
  ) {}

  static fromRequest(id: string, request: CreateTokenRequest): CreateTokenCommand {
    return new CreateTokenCommand(
      id,
      request.email.toLowerCase(),
      request.password,
      request.refreshToken,
      request?.role,
      request?.invalidateTokens,
    );
  }
}
