import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { UserDto } from '~/common/application/query/user/dto/user.dto';
import { UserWasCreated } from './event/user-was-created';
import { UserRolesWereUpdated } from './event/user-roles-were-updated';
import { UserWasDeleted } from './event/user-was-deleted';
import { DomainAbstractRoot } from '~/common/domain/domain-abstract-root';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { UserUnverifiedEmailWasSet } from './event/user-unverified-email-was-set';
import { UserPasswordWasUpdated } from './event/user-password-was-updated';
import { UserEmailWasVerified } from '~/user/domain/model/user/event/user-email-was-verified';
import { ValidationException } from '~/common/domain/exception/validation.exception';
import { Email } from '~/common/domain/model/value-object/email';
import { Id } from '~/common/domain/model/value-object/id';

export class UserModel extends DomainAbstractRoot {
  protected _password?: string;

  constructor(
    protected readonly _internalId: number,
    protected readonly _id: Id,
    protected _email: Email,
    protected _roles: Array<UserRoles>,
    protected readonly _createdAt: Dayjs = dayjs(),
    protected _updatedAt: Dayjs = dayjs(),
    protected _unverifiedEmail: Email | null = null,
    protected _deletedAt?: Dayjs,
  ) {
    super();
  }

  public get id(): Id {
    return this._id;
  }

  public get email(): Email {
    return this._email;
  }

  public get roles(): Array<UserRoles> {
    return this._roles;
  }

  public get createdAt(): Dayjs {
    return this._createdAt;
  }

  public get internalId(): number {
    return this._internalId;
  }

  public get updatedAt(): Dayjs {
    return this._updatedAt;
  }

  public get unverifiedEmail(): Email | null {
    return this._unverifiedEmail;
  }

  public get deletedAt(): Dayjs | undefined {
    return this._deletedAt;
  }

  public get password(): string | undefined {
    return this._password;
  }

  static create(createdAt: Dayjs, id: Id, email: Email, password: string, roles: UserRoles[] = []): UserModel {
    const user = new UserModel(0, id, email, roles, createdAt);
    user._unverifiedEmail = email;
    user._password = password;
    user._updatedAt = createdAt;

    user.apply(new UserWasCreated(id.toString(), createdAt.toDate(), user.getDto(), email.toString(), roles));

    return user;
  }

  setUnverifiedEmail(updatedAt: Dayjs, email: Email): UserModel {
    this._unverifiedEmail = email;
    this._updatedAt = updatedAt;

    this.apply(new UserUnverifiedEmailWasSet(this.id.toString(), updatedAt.toDate(), this.dto, email.toString()));

    return this;
  }

  verifyEmail(updatedAt: Dayjs, email: Email): UserModel {
    if (!this._unverifiedEmail || !this._unverifiedEmail.equals(email)) {
      throw new ValidationException('Email does not match the unverified email');
    }

    this._email = email;
    this._unverifiedEmail = null;
    this._updatedAt = updatedAt;
    this._roles.push(UserRoles.VerifiedUser);

    this.apply(new UserEmailWasVerified(this.id.toString(), updatedAt.toDate(), this.dto, email.toString()));

    return this;
  }

  updatePassword(updatedAt: Dayjs, password: string): UserModel {
    this._password = password;
    this._updatedAt = updatedAt;

    this.apply(new UserPasswordWasUpdated(this.id.toString(), updatedAt.toDate(), this.dto));

    return this;
  }

  updateRoles(updatedAt: Dayjs, roles: UserRoles[]): UserModel {
    const rolesAreEqual = this.roles.length === roles.length && this.roles.every((role) => roles.includes(role));

    if (rolesAreEqual) {
      return this;
    }

    const validRoles = Object.values(UserRoles);
    const invalidRoles = roles.filter((role) => !validRoles.includes(role));

    if (invalidRoles.length > 0) {
      throw new ValidationException(`Invalid roles: ${invalidRoles.join(', ')}`);
    }
    this._roles = roles;
    this._updatedAt = updatedAt;

    this.apply(new UserRolesWereUpdated(this.id.toString(), updatedAt.toDate(), this.dto, roles));

    return this;
  }

  delete(deletedAt: Dayjs): UserModel {
    this._deletedAt = deletedAt;
    this.apply(new UserWasDeleted(this.id.toString(), deletedAt.toDate(), this.dto));

    return this;
  }

  public get dto(): UserDto {
    return new UserDto(
      this._id.toString(),
      this._email.toString(),
      this._roles,
      this._createdAt.toDate(),
      this._updatedAt.toDate(),
      this._unverifiedEmail ? this._unverifiedEmail.toString() : undefined,
    );
  }

  getDto(): DtoInterface {
    return this.dto;
  }

  isDeleted(): boolean {
    return !!this._deletedAt;
  }
}
