import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateActionRequestRequest } from '~/auth/infrastructure/controller/action-request/request/create-action-request.request';
import { CreateActionRequestCommand } from '~/auth/application/command/action-request/create-action-request.command';
import { RequestIdProvider } from '~/common/infrastructure/logging/request-id-provider';
import { GetActionRequestQuery } from '~/auth/application/query/action-request/get-action-request.query';

@Controller('auth')
export class CreateActionRequestAction {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly requestIdProvider: RequestIdProvider,
  ) {}

  @Post('action-requests')
  @HttpCode(202)
  async invoke(@Body() request: CreateActionRequestRequest) {
    const requestId = this.requestIdProvider.getRequestId();

    const command = new CreateActionRequestCommand(requestId, request.token);
    await this.commandBus.execute(command);

    const query = new GetActionRequestQuery(requestId);
    return await this.queryBus.execute(query);
  }
}
