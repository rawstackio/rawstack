import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyUserEmailCommand } from '~/user/application/command/user/verify-user-email.command';
import { VerifyUserEmailService } from '~/user/domain/service/user/verify-user-email.service';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

@CommandHandler(VerifyUserEmailCommand)
export class VerifyUserEmailCommandHandler implements ICommandHandler<VerifyUserEmailCommand> {
  constructor(private readonly service: VerifyUserEmailService) {}

  async execute(command: VerifyUserEmailCommand): Promise<void> {
    const { id, email } = command;

    await this.service.invoke(new Id(id), new Email(email));
  }
}
