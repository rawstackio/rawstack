import * as dayjs from 'dayjs';
import { UserRepositoryInterface } from '../../model/user/user-repository.interface';
import { LoggedInUser } from '~/common/domain/logged-in-user';
import { ForbiddenException } from '~/common/domain/exception/forbidden.exception';
import { UserRoles } from '~/common/domain/enum/user-roles';

export class DeleteUserService {
  constructor(private repository: UserRepositoryInterface) {}

  async invoke(actor: LoggedInUser, id: string): Promise<void> {
    if (actor.id !== id && !actor.roles.includes(UserRoles.Admin)) {
      throw new ForbiddenException(`actor ${actor.id} is not allowed to delete user ${id}`);
    }

    const dateNow = dayjs();
    const user = await this.repository.findById(id);

    user.delete(dateNow);

    await this.repository.persist(user);
  }
}
