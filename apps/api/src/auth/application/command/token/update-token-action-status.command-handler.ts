import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTokenActionStatusCommand } from '~/auth/application/command/token/update-token-action-status.command';
import { UpdateActionRequestService } from '~/auth/domain/service/action-request/update-action-request.service';

@CommandHandler(UpdateTokenActionStatusCommand)
export class UpdateTokenActionStatusCommandHandler implements ICommandHandler<UpdateTokenActionStatusCommand> {
  constructor(private service: UpdateActionRequestService) {}

  async execute(command: UpdateTokenActionStatusCommand): Promise<void> {
    await this.service.invoke(command.id, command.status);
  }
}
