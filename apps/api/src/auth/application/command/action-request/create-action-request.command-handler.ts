import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateActionRequestCommand } from '~/auth/application/command/action-request/create-action-request.command';
import { CreateActionRequestService } from '~/auth/domain/service/action-request/create-action-request.service';
import { VerifyAndUseTokenService } from '~/auth/domain/service/token/verify-and-use-token.service';
import { ExtractActionRequestDataService } from '~/auth/domain/service/action-request/extract-action-request-data.service';
import { Id } from '~/common/domain/model/value-object/id'

@CommandHandler(CreateActionRequestCommand)
export class CreateActionRequestCommandHandler implements ICommandHandler<CreateActionRequestCommand> {
  constructor(
    private readonly extract: ExtractActionRequestDataService,
    private readonly actionService: CreateActionRequestService,
    private readonly tokenService: VerifyAndUseTokenService,
  ) {}

  async execute(command: CreateActionRequestCommand): Promise<void> {
    // verify and convert the token into an action request
    const data = await this.extract.invoke(command.token);

    const tokenId = data.data.tokenId;

    // verify and use the token
    await this.tokenService.invoke(tokenId, data.data.userId);

    // persist the action request
    await this.actionService.invoke(
      new Id(command.id),
      data.action,
      tokenId,
      data.data.userId,
      data.data.email
    );
  }
}
