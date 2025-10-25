import { ICommand } from '@nestjs/cqrs';
import { CreateUserRequest } from '~/user/infrastructure/controller/user/request/create-user.request';
import { UserRoles } from '~/common/domain/enum/user-roles';

export class CreateUserCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly roles: UserRoles[] = [],
  ) {}

  static fromRequest(id: string, dto: CreateUserRequest): CreateUserCommand {
    return new CreateUserCommand(id, dto.email.toLowerCase(), dto.password);
  }
}
