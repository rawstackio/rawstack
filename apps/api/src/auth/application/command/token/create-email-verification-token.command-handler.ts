import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEmailVerificationTokenCommand } from '~/auth/application/command/token/create-email-verification-token.command';
import { CreateEmailVerificationTokenService } from '~/auth/domain/service/token/create-email-verification-token.service';

@CommandHandler(CreateEmailVerificationTokenCommand)
export class CreateEmailVerificationTokenCommandHandler
  implements ICommandHandler<CreateEmailVerificationTokenCommand>
{
  constructor(private service: CreateEmailVerificationTokenService) {}

  async execute(command: CreateEmailVerificationTokenCommand): Promise<void> {
    await this.service.invoke(command.id, command.userId, command.unverifiedEmail);
  }
}
