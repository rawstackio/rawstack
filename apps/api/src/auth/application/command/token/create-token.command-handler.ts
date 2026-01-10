import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTokenCommand } from './create-token.command';
import { CreateRefreshTokenService } from '~/auth/domain/service/token/create-refresh-token.service';
import { CreatePasswordResetTokenService } from '~/auth/domain/service/token/create-password-reset-token.service';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

@CommandHandler(CreateTokenCommand)
export class CreateTokenCommandHandler implements ICommandHandler<CreateTokenCommand> {
  constructor(
    private refreshTokenService: CreateRefreshTokenService,
    private passwordTokenService: CreatePasswordResetTokenService,
  ) {}

  async execute(command: CreateTokenCommand): Promise<void> {
    if (!command.password && !command.refreshToken) {
      await this.passwordTokenService.invoke(new Id(command.id), new Email(command.email));
    } else {
      await this.refreshTokenService.invoke(new Id(command.id), new Email(command.email), command.password, command.refreshToken);
    }
  }
}
