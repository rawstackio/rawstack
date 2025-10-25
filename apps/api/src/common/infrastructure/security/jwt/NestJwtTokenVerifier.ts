import { Inject, Injectable } from '@nestjs/common';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';
import { TokenVerifierInterface } from '~/common/domain/token-verifier.interface';
import { InvalidTokenException } from '~/common/domain/exception/invalid-token.exception';

@Injectable()
export class NestJwtTokenVerifier implements TokenVerifierInterface {
  constructor(
    private readonly jwt: JwtService,
    @Inject('JWT_SECRET') private jwtSecret: string,
  ) {}

  async verify<TPayload extends object = any>(token: string): Promise<TPayload> {
    try {
      return this.jwt.verifyAsync<TPayload>(token, { secret: this.jwtSecret });
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        throw new InvalidTokenException('Token has expired');
      } else if (error instanceof JsonWebTokenError) {
        throw new InvalidTokenException('Invalid token signature');
      } else if (error instanceof NotBeforeError) {
        throw new InvalidTokenException('Token not yet valid');
      }
      throw error;
    }
  }
}
