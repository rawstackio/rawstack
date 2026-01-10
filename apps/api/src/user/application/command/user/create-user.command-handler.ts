import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateUserCommand } from './create-user.command';
import { CreateUserService } from '~/user/domain/service/user/create-user.service';
import { LoggedInUserProvider } from '~/common/infrastructure/security/provider/logged-in-user.provider';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private service: CreateUserService,
    private readonly actorProvider: LoggedInUserProvider,
  ) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const actor = this.actorProvider.getLoggedInUser();

    // Track whether password was provided in the original request
    const passwordWasProvided = command.password !== undefined;

    // Generate a random UUID password if password is not provided
    const password = command.password ?? randomUUID();

    await this.service.invoke(
      actor,
      new Id(command.id),
      new Email(command.email),
      password,
      command.roles,
      passwordWasProvided,
    );
  }
}
