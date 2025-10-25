import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { CreateUserService } from '~/user/domain/service/user/create-user.service';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private service: CreateUserService) {}

  async execute(command: CreateUserCommand): Promise<void> {
    await this.service.invoke(command.id, command.email, command.password, command.roles);
  }
}
