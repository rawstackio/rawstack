import { UpdateUserRequest } from '~/user/infrastructure/controller/user/request/update-user.request';
import { UserRoles } from '~/common/domain/enum/user-roles';

export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly email?: string,
    public readonly password?: string,
    public readonly roles?: UserRoles[],
  ) {}

  static fromRequest(id: string, dto: UpdateUserRequest): UpdateUserCommand {
    return new UpdateUserCommand(id, dto.email?.toLowerCase(), dto.password, dto.roles);
  }
}
