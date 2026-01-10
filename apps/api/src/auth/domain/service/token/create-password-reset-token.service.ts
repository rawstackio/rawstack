import * as dayjs from 'dayjs';
import { TokenRepositoryInterface } from '../../model/token/token-repository.interface';
import { TokenModel } from '../../model/token/token.model';
import { EntityNotFoundException } from '~/common/domain/exception/entity-not-found.exception';
import { createHash, randomUUID } from 'crypto';
import { TokenHashRepositoryInterface } from '~/auth/domain/model/token/token-hash-repository.interface';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

export class CreatePasswordResetTokenService {
  constructor(
    private repository: TokenRepositoryInterface,
    private hashRepository: TokenHashRepositoryInterface,
    private readonly tokenTtlSeconds: number,
  ) {}

  async invoke(id: Id, email: Email): Promise<void> {
    let user: { hash: string; id: Id };
    try {
      user = await this.repository.findTokenUserByEmail(email);
    } catch (e: unknown) {
      if (e instanceof EntityNotFoundException) {
        return;
      }
      throw e;
    }

    const tokenExpiresAt = dayjs().add(this.tokenTtlSeconds, 'seconds');

    const tokenString = randomUUID();
    const tokenHash = createHash('sha256').update(tokenString, 'utf8').digest('hex');

    this.hashRepository.persist(tokenHash, tokenString);

    const token = TokenModel.create(
      id,
      tokenHash,
      user.id,
      id,
      dayjs(),
      tokenExpiresAt,
      'PASSWORD_RESET',
      email,
      tokenString,
    );

    await this.repository.persist(token);
  }
}
