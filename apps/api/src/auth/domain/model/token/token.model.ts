import { Dayjs } from 'dayjs';
import { TokenWasCreated } from '~/auth/domain/model/token/event/token-was-created';
import { DomainAbstractRoot } from '~/common/domain/domain-abstract-root';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';
import { TokenWasUsed } from '~/auth/domain/model/token/event/token-was-used';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

export type TokenModelType = 'LOGIN' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION';

export class TokenModel extends DomainAbstractRoot {
  constructor(
    protected readonly _internalId: number,
    protected readonly _id: Id,
    protected readonly _tokenHash: string,
    protected readonly _userId: Id,
    protected readonly _rootTokenId: Id,
    protected readonly _createdAt: Dayjs,
    protected readonly _expiresAt: Dayjs,
    protected readonly _type: TokenModelType = 'LOGIN',
    protected _usedAt?: Dayjs,
  ) {
    super();
  }

  public get internalId(): number {
    return this._internalId;
  }

  public get id(): Id {
    return this._id;
  }

  public get tokenHash(): string {
    return this._tokenHash;
  }

  public get userId(): Id {
    return this._userId;
  }

  public get rootTokenId(): Id {
    return this._rootTokenId;
  }

  public get createdAt(): Dayjs {
    return this._createdAt;
  }

  public get expiresAt(): Dayjs {
    return this._expiresAt;
  }

  public get type(): TokenModelType {
    return this._type;
  }

  public get usedAt(): Dayjs | undefined {
    return this._usedAt;
  }

  static create(
    id: Id,
    tokenHash: string,
    userId: Id,
    rootTokenId: Id,
    createdAt: Dayjs,
    expiresAt: Dayjs,
    type: TokenModelType = 'LOGIN',
    email?: Email,
    tokenRaw?: string,
  ): TokenModel {
    const token = new TokenModel(0, id, tokenHash, userId, rootTokenId, createdAt, expiresAt, type);
    token.apply(new TokenWasCreated(id.toString(), createdAt.toDate(), userId.toString(), expiresAt, type, email?.toString(), tokenRaw));

    return token;
  }

  use(usedAt: Dayjs): TokenModel {
    this._usedAt = usedAt;
    this.apply(new TokenWasUsed(this.id.toString(), usedAt.toDate(), this.userId.toString(), this._type));

    return this;
  }

  getDto(): DtoInterface | null {
    return null;
  }

  isValid(userId: Id, date: Dayjs): boolean {
    if (this._expiresAt.isBefore(date)) {
      return false;
    }

    if (this.usedAt) {
      return false;
    }

    return this.userId.toString() === userId.toString();
  }

  isDeleted(): boolean {
    return false;
  }
}
