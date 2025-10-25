import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateTokenRequest } from '~/auth/infrastructure/controller/token/request/create-token.request';
import { CreateTokenCommand } from '~/auth/application/command/token/create-token.command';
import { TokenResponseDto } from '~/auth/application/query/token/dto/token.response-dto';
import { GetTokenQuery } from '~/auth/application/query/token/get-token.query';

@Controller('auth')
export class CreateTokenAction {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post('tokens')
  async invoke(@Body() request: CreateTokenRequest): Promise<TokenResponseDto> {
    const id = randomUUID();

    const command = CreateTokenCommand.fromRequest(id, request);
    await this.commandBus.execute(command);

    const query = new GetTokenQuery(id, request.email);
    return await this.queryBus.execute(query);
  }
}
