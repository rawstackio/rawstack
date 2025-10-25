import * as dayjs from 'dayjs';
import * as argon from 'argon2';
import { UserRepositoryInterface } from '../../model/user/user-repository.interface';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { LoggedInUser } from '~/common/domain/logged-in-user';
import { ForbiddenException } from '~/common/domain/exception/forbidden.exception';
import { ValidationException } from '~/common/domain/exception/validation.exception';
import { ConflictException } from '~/common/domain/exception/conflict.exception';

export class UpdateUserService {
  constructor(private repository: UserRepositoryInterface) {}

  async invoke(actor: LoggedInUser, id: string, email?: string, password?: string, roles?: UserRoles[]): Promise<void> {
    if (actor.id !== id && !actor.roles.includes(UserRoles.Admin)) {
      throw new ForbiddenException(`actor ${actor.id} is not allowed to update user ${id}`);
    }

    if (!email && !password && !roles) {
      throw new ValidationException('at least one value (email, password, roles) must be provided to update user');
    }

    const user = await this.repository.findById(id);
    const dateNow = dayjs();

    if (email && email !== user.email) {
      const existing = await this.repository.existsByEmail(email);
      if (existing) {
        throw new ConflictException(`email ${email} already exists`);
      }
      user.setUnverifiedEmail(dateNow, email);
    }

    if (roles) {
      if (!actor.roles.includes(UserRoles.Admin)) {
        throw new ForbiddenException('only admins can update users roles');
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
