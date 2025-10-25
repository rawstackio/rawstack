import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyUserEmailCommand } from '~/user/application/command/user/verify-user-email.command';
import { VerifyUserEmailService } from '~/user/domain/service/user/verify-user-email.service';

@CommandHandler(VerifyUserEmailCommand)
export class VerifyUserEmailCommandHandler implements ICommandHandler<VerifyUserEmailCommand> {
  constructor(private readonly service: VerifyUserEmailService) {}

  async execute(command: VerifyUserEmailCommand): Promise<void> {
    const { id, email } = command;

    await this.service.invoke(id, email);
  }
}
