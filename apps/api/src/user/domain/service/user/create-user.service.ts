import * as dayjs from 'dayjs';
import * as argon from 'argon2';
import { UserModel } from '../../model/user/user.model';
import { UserRepositoryInterface } from '../../model/user/user-repository.interface';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { LoggedInUser } from '~/common/domain/logged-in-user';
import { ForbiddenException } from '~/common/domain/exception/forbidden.exception';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

export class CreateUserService {
  constructor(private repository: UserRepositoryInterface) {}

  async invoke(
    actor: LoggedInUser | null,
    id: Id,
    email: Email,
    password: string,
    roles?: UserRoles[],
    passwordWasProvided: boolean = true,
  ): Promise<void> {
    const actorIsAdmin = actor && actor.roles.includes(UserRoles.Admin);

    // If no password was provided, only admins can create users
    if (!passwordWasProvided) {
      if (!actorIsAdmin) {
        throw new ForbiddenException('only admins can create users without providing a password');
      }
    }

    // Only admin can update roles
    if (roles?.length) {
      if (!actorIsAdmin) {
        throw new ForbiddenException('only admins can create users with roles xxxxxx');
      }
    }

    const hashedPassword = await argon.hash(password);
    const dateNow = dayjs();

    const userModel = UserModel.create(dateNow, id, email, hashedPassword, roles);

    await this.repository.persist(userModel);
  }
}
