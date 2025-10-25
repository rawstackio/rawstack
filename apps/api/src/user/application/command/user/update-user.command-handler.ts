import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from './update-user.command';
import { UpdateUserService } from '~/user/domain/service/user/update-user.service';
import { LoggedInUserProvider } from '~/common/infrastructure/security/provider/logged-in-user.provider';
import { UnauthorizedException } from '~/common/domain/exception/unauthorized.exception';

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly service: UpdateUserService,
    private readonly actorProvider: LoggedInUserProvider,
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const { id, password, email, roles } = command;

    const actor = this.actorProvider.getLoggedInUser();
    if (!actor) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.service.invoke(actor, id, email, password, roles);
  }
}
