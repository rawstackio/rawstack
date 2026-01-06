import * as dayjs from 'dayjs';
import * as argon from 'argon2';
import { createHash, randomUUID } from 'crypto';
import { TokenRepositoryInterface } from '../../model/token/token-repository.interface';
import { TokenModel, TokenModelType } from '../../model/token/token.model';
import { EntityNotFoundException } from '~/common/domain/exception/entity-not-found.exception';
import { TokenHashRepositoryInterface } from '~/auth/domain/model/token/token-hash-repository.interface';
import { UnauthorizedException } from '~/common/domain/exception/unauthorized.exception';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

type TokenUser = { hash: string; id: Id };

export class CreateRefreshTokenService {
  constructor(
    private repository: TokenRepositoryInterface,
    private hashRepository: TokenHashRepositoryInterface,
    private readonly refreshTokenTtlSeconds: number,
  ) {}

  async invoke(id: Id, email: Email, password?: string, refreshToken?: string, role?: string): Promise<void> {
    let user: TokenUser;
    const type = 'LOGIN';
    let rootTokenId = undefined;

    try {
      user = await this.repository.findTokenUserByEmail(email, role);
    } catch (e: unknown) {
      if (!(e instanceof EntityNotFoundException)) {
        throw e;
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = dayjs();

    if (refreshToken) {
      const tokenHash = createHash('sha256').update(refreshToken, 'utf8').digest('hex');
      let tokenModel: TokenModel;
      try {
        tokenModel = await this.repository.findByTokenHash(tokenHash);
      } catch (e: unknown) {
        if (!(e instanceof EntityNotFoundException)) {
          throw e;
        }
        throw new UnauthorizedException('Invalid credentials');
      }

      // For auto reuse detection, here we check if the usedAt Date is set
      // if it is, delete all tokens in the tree.
      // ie all token using this token's rootTokenId
      if (tokenModel.usedAt) {
        await this.repository.deleteAllByRootTokenId(tokenModel.rootTokenId);
        throw new UnauthorizedException('Invalid credentials');
      }

      // check token validity
      if (!tokenModel.isValid(user.id, now)) {
        throw new UnauthorizedException('Invalid credentials');
      }

      tokenModel.use(now);
      await this.repository.persist(tokenModel);

      rootTokenId = tokenModel.rootTokenId;
    } else if (password) {
      const match = await argon.verify(user.hash, password);
      if (!match) {
        throw new UnauthorizedException('Invalid credentials');
      }

      rootTokenId = id;
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }

    const refreshTokenExpiresAt = dayjs().add(this.refreshTokenTtlSeconds, 'seconds');

    const tokenString = randomUUID();
    const tokenHash = createHash('sha256').update(tokenString, 'utf8').digest('hex');

    this.hashRepository.persist(tokenHash, tokenString);

    const token = TokenModel.create(
      id,
      tokenHash,
      user.id,
      rootTokenId,
      now,
      refreshTokenExpiresAt,
      type as TokenModelType,
    );

    await this.repository.persist(token);
  }
}
