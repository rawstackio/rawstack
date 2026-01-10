import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserResponseDto } from '~/user/application/query/user/dto/user.response-dto';
import { CreateUserRequest } from './request/create-user.request';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '~/user/application/command/user/create-user.command';
import { GetUserQuery } from '~/user/application/query/user/get-user.query';
import { OptionalGuard } from '~/common/infrastructure/security/guard/optional.guard';

@Controller('user/users')
export class CreateUserAction {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @UseGuards(OptionalGuard)
  @Post()
  async invoke(@Body() dto: CreateUserRequest): Promise<UserResponseDto> {
    const id = randomUUID();

    const command = CreateUserCommand.fromRequest(id, dto);
    await this.commandBus.execute(command);

    const query = new GetUserQuery(id);
    return await this.queryBus.execute(query);
  }
}
