import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserResponseDto } from '~/user/application/query/user/dto/user.response-dto';
import { GetUserQuery } from '~/user/application/query/user/get-user.query';
import { JwtGuard } from '~/common/infrastructure/security/guard/auth.guard';
import { UpdateUserRequest } from './request/update-user.request';
import { UpdateUserCommand } from '~/user/application/command/user/update-user.command';
import { UserUserGuard } from '~/common/infrastructure/security/guard/user.user.guard';

@Controller('user/users')
export class UpdateUserAction {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @UseGuards(JwtGuard, UserUserGuard({ action: 'UPDATE_USER' }))
  @Patch(':userId')
  async invoke(@Param('userId') id: string, @Body() requestDto: UpdateUserRequest): Promise<UserResponseDto> {
    const command = UpdateUserCommand.fromRequest(id, requestDto);
    await this.commandBus.execute(command);

    const query = new GetUserQuery(id);
    return await this.queryBus.execute(query);
  }
}
