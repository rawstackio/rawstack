import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { UserResponseDto } from '~/user/application/query/user/dto/user.response-dto';
import { GetUserQuery } from '~/user/application/query/user/get-user.query';
import { JwtGuard } from '~/common/infrastructure/security/guard/auth.guard';
import { AdminGuard } from '~/common/infrastructure/security/guard/admin.guard';

@Controller('user/users')
export class GetUserAction {
  constructor(private queryBus: QueryBus) {}

  @UseGuards(JwtGuard, AdminGuard)
  @Get(':userId')
  async invoke(@Param('userId') id: string): Promise<UserResponseDto> {
    const query = new GetUserQuery(id);

    return await this.queryBus.execute(query);
  }
}
