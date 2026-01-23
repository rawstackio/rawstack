import { UserModel } from './user.model';
import { UserRoles } from '~/common/domain/enum/user-roles';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

export interface UserRepositoryInterface {
  persist(User: UserModel): Promise<UserModel>;

  listIds(
    page: number,
    perPage: number,
    q?: string,
    role?: UserRoles,
    orderBy?: string,
    order?: string,
  ): Promise<string[]>;

  count(q?: string, role?: UserRoles): Promise<number>;

  findById(id: Id): Promise<UserModel>;

  findByIds(ids: Id[]): Promise<UserModel[]>;

  existsByEmail(email: Email): Promise<boolean>;
}
