import { Dayjs } from 'dayjs';
import { TokenWasCreated } from '~/auth/domain/model/token/event/token-was-created';
import { DomainAbstractRoot } from '~/common/domain/domain-abstract-root';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';
import { TokenWasUsed } from '~/auth/domain/model/token/event/token-was-used';

export type TokenModelType = 'LOGIN' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION';

export class TokenModel extends DomainAbstractRoot {
  public internalId = 0;
  public usedAt?: Dayjs;

  constructor(
    public id: string,
    public tokenHash: string,
    public userId: string,
    public rootTokenId: string,
    public createdAt: Dayjs,
    public expiresAt: Dayjs,
    public type: TokenModelType = 'LOGIN',
  ) {
    super();
  }

  static create(
    id: string,
    tokenHash: string,
    userId: string,
    rootTokenId: string,
    createdAt: Dayjs,
    expiresAt: Dayjs,
    type: TokenModelType = 'LOGIN',
    email?: string,
    tokenRaw?: string,
  ): TokenModel {
    const token = new TokenModel(id, tokenHash, userId, rootTokenId, createdAt, expiresAt, type);
    token.apply(new TokenWasCreated(id, createdAt.toDate(), userId, expiresAt, type, email, tokenRaw));

    return token;
  }

  use(usedAt: Dayjs): TokenModel {
    this.usedAt = usedAt;
    this.apply(new TokenWasUsed(this.id, usedAt.toDate(), this.userId, this.type));

    return this;
  }

  getDto(): DtoInterface | null {
    return null;
  }

  isValid(userId: string, date: Dayjs): boolean {
    if (this.expiresAt.isBefore(date)) {
      return false;
    }

    if (this.usedAt) {
      return false;
    }

    if (this.userId !== userId) {
      return false;
    }

    return true;
  }

  isDeleted(): boolean {
    return false;
  }
}
