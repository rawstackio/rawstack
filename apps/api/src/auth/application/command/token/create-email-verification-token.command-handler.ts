import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEmailVerificationTokenCommand } from '~/auth/application/command/token/create-email-verification-token.command';
import { CreateEmailVerificationTokenService } from '~/auth/domain/service/token/create-email-verification-token.service';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

@CommandHandler(CreateEmailVerificationTokenCommand)
export class CreateEmailVerificationTokenCommandHandler implements ICommandHandler<CreateEmailVerificationTokenCommand> {
  constructor(private service: CreateEmailVerificationTokenService) {}

  async execute(command: CreateEmailVerificationTokenCommand): Promise<void> {
    await this.service.invoke(new Id(command.id), new Id(command.userId), new Email(command.unverifiedEmail));
  }
}
