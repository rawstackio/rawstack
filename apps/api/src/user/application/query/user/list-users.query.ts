import { UserRoles } from '~/common/domain/enum/user-roles';
import { ListUsersQueryParamsDto } from '~/user/infrastructure/controller/user/request/list-users-query-parmas.request';

export class ListUsersQuery {
  constructor(
    public readonly page?: number,
    public readonly perPage?: number,
    public readonly q?: string,
    public readonly role?: UserRoles,
    public readonly orderBy?: 'createdAt' | 'updatedAt' | 'email',
    public readonly order?: 'ASC' | 'DESC',
  ) {}

  static fromQuery(query: ListUsersQueryParamsDto): ListUsersQuery {
    return new ListUsersQuery(query.page, query.perPage, query.q, query.role as UserRoles, query.orderBy, query.order);
  }
}
