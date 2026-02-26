import * as dayjs from 'dayjs';
import * as argon from 'argon2';
import { UserRepositoryInterface } from '../../model/user/user-repository.interface';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { LoggedInUser } from '~/common/domain/logged-in-user';
import { ForbiddenException } from '~/common/domain/exception/forbidden.exception';
import { ValidationException } from '~/common/domain/exception/validation.exception';
import { ConflictException } from '~/common/domain/exception/conflict.exception';
import { Email } from '~/common/domain/model/value-object/email';
import { Id } from '~/common/domain/model/value-object/id';

export class UpdateUserService {
  constructor(private repository: UserRepositoryInterface) {}

  async invoke(actor: LoggedInUser, id: Id, email?: Email, password?: string, roles?: UserRoles[]): Promise<void> {
    if (!actor.id.equals(id) && !actor.roles.includes(UserRoles.Admin)) {
      throw new ForbiddenException(`actor ${actor.id} is not allowed to update user ${id.toString()}`);
    }

    if (!email && !password && !roles) {
      throw new ValidationException('at least one value (email, password, roles) must be provided to update user');
    }

    const user = await this.repository.findById(id);
    const dateNow = dayjs();

    if (email && !email.equals(user.email)) {
      const existing = await this.repository.existsByEmail(email);
      if (existing) {
        throw new ConflictException(`email ${email.toString()} already exists`);
      }
      user.setUnverifiedEmail(dateNow, email);
    } else if (email && user.unverifiedEmail && email.equals(user.unverifiedEmail)) {
      user.setUnverifiedEmail(dateNow, email);
    }

    if (roles) {
      if (!actor.roles.includes(UserRoles.Admin)) {
        throw new ForbiddenException('only admins can update users roles');
      }

      if (actor.id === user.id) {
        throw new ForbiddenException('users cannot update there own roles');
      }

      user.updateRoles(dateNow, roles);
    }
    if (password) {
      const hashedPassword = await argon.hash(password);
      user.updatePassword(dateNow, hashedPassword);
    }

    await this.repository.persist(user);
  }
}
