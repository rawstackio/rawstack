import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { DeleteUserCommand } from './delete-user.command';
import { DeleteUserService } from '~/user/domain/service/user/delete-user.service';
import { UnauthorizedException } from '~/common/domain/exception/unauthorized.exception';
import { LoggedInUserProvider } from '~/common/infrastructure/security/provider/logged-in-user.provider';
import { Id } from '~/common/domain/model/value-object/id';

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private service: DeleteUserService,
    private readonly actorProvider: LoggedInUserProvider,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const actor = this.actorProvider.getLoggedInUser();
    if (!actor) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.service.invoke(actor, new Id(command.id));
  }
}
