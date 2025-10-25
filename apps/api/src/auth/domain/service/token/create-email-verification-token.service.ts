import * as dayjs from 'dayjs';
import { TokenRepositoryInterface } from '../../model/token/token-repository.interface';
import { TokenModel } from '~/auth/domain/model/token/token.model';
import { createHash, randomUUID } from 'crypto';

export class CreateEmailVerificationTokenService {
  constructor(
    private repository: TokenRepositoryInterface,
    private readonly tokenTtlSeconds: number,
  ) {}

  async invoke(id: string, userId: string, email: string): Promise<void> {
    const refreshTokenExpiresAt = dayjs().add(this.tokenTtlSeconds, 'seconds');

    const tokenString = randomUUID();
    const tokenHash = createHash('sha256').update(tokenString, 'utf8').digest('hex');
    const token = TokenModel.create(
      id,
      tokenHash,
      userId,
      userId,
      dayjs(),
      refreshTokenExpiresAt,
      'EMAIL_VERIFICATION',
      email,
      tokenString,
    );

    await this.repository.persist(token);
  }
}
