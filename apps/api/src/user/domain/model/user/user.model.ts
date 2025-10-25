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

export class UserModel extends DomainAbstractRoot {
  public internalId = 0;
  public password?: string;
  public unverifiedEmail?: string | null;
  public createdAt: Dayjs = dayjs();
  public updatedAt: Dayjs = dayjs();
  public deletedAt?: Dayjs;

  constructor(
    public id: string,
    public email: string,
    public roles: Array<UserRoles>,
  ) {
    super();
  }

  static create(createdAt: Dayjs, id: string, email: string, password: string, roles: UserRoles[] = []): UserModel {
    const user = new UserModel(id, email, roles);
    user.unverifiedEmail = email;
    user.password = password;
    user.createdAt = createdAt;
    user.updatedAt = createdAt;

    user.apply(new UserWasCreated(id, createdAt.toDate(), user.getDto(), email, roles));

    return user;
  }

  setUnverifiedEmail(updatedAt: Dayjs, email: string): UserModel {
    this.unverifiedEmail = email;
    this.updatedAt = updatedAt;

    this.apply(new UserUnverifiedEmailWasSet(this.id, updatedAt.toDate(), this.dto, email));

    return this;
  }

  verifyEmail(updatedAt: Dayjs, email: string): UserModel {
    if (email !== this.unverifiedEmail) {
      throw new ValidationException('Email does not match the unverified email');
    }

    this.email = email;
    this.unverifiedEmail = null;
    this.updatedAt = updatedAt;
    this.roles.push(UserRoles.VerifiedUser);

    this.apply(new UserEmailWasVerified(this.id, updatedAt.toDate(), this.dto, email));

    return this;
  }

  updatePassword(updatedAt: Dayjs, password: string): UserModel {
    this.password = password;
    this.updatedAt = updatedAt;

    this.apply(new UserPasswordWasUpdated(this.id, updatedAt.toDate(), this.dto));

    return this;
  }

  updateRoles(updatedAt: Dayjs, roles: UserRoles[]): UserModel {
    this.roles = roles;
    this.updatedAt = updatedAt;

    this.apply(new UserRolesWereUpdated(this.id, updatedAt.toDate(), this.dto, roles));

    return this;
  }

  delete(deletedAt: Dayjs): UserModel {
    this.deletedAt = deletedAt;
    this.apply(new UserWasDeleted(this.id, deletedAt.toDate(), this.dto));

    return this;
  }

  public get dto(): UserDto {
    return new UserDto(
      this.id,
      this.email,
      this.roles,
      this.createdAt.toDate(),
      this.updatedAt.toDate(),
      this.unverifiedEmail || undefined,
    );
  }

  getDto(): DtoInterface {
    return this.dto;
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }
}
