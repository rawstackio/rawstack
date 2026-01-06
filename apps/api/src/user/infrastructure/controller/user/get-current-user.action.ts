import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { UserResponseDto } from '~/user/application/query/user/dto/user.response-dto';
import { GetUserQuery } from '~/user/application/query/user/get-user.query';
import { JwtGuard } from '~/common/infrastructure/security/guard/auth.guard';
import { User } from '~/common/infrastructure/security/decorator/logged-in-user.decorator';
import { LoggedInUser } from '~/common/domain/logged-in-user';

@Controller('user/users')
export class GetCurrentUserAction {
  constructor(private queryBus: QueryBus) {}

  @UseGuards(JwtGuard)
  @Get('current')
  async invoke(@User() user: LoggedInUser): Promise<UserResponseDto> {
    const query = new GetUserQuery(user.id.toString());

    return await this.queryBus.execute(query);
  }
}
