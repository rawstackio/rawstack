import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTokenCommand } from './create-token.command';
import { CreateRefreshTokenService } from '~/auth/domain/service/token/create-refresh-token.service';
import { CreatePasswordResetTokenService } from '~/auth/domain/service/token/create-password-reset-token.service';

@CommandHandler(CreateTokenCommand)
export class CreateTokenCommandHandler implements ICommandHandler<CreateTokenCommand> {
  constructor(
    private refreshTokenService: CreateRefreshTokenService,
    private passwordTokenService: CreatePasswordResetTokenService,
  ) {}

  async execute(command: CreateTokenCommand): Promise<void> {
    if (!command.password && !command.refreshToken) {
      await this.passwordTokenService.invoke(command.id, command.email);
    } else {
      await this.refreshTokenService.invoke(command.id, command.email, command.password, command.refreshToken);
    }
  }
}
