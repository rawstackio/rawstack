import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetActionRequestQuery } from '~/auth/application/query/action-request/get-action-request.query';

@Controller('auth')
export class GetActionRequestAction {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('action-requests/:requestId')
  async invoke(@Param('requestId') id: string) {
    const query = new GetActionRequestQuery(id);
    return await this.queryBus.execute(query);
  }
}
