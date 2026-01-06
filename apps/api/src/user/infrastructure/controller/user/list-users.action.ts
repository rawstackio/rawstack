import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtGuard } from '~/common/infrastructure/security/guard/auth.guard';
import { UserCollectionResponseDto } from '~/user/application/query/user/dto/user-collection.response-dto';
import { ListUsersQuery } from '~/user/application/query/user/list-users.query';
import { AdminGuard } from '~/common/infrastructure/security/guard/admin.guard';
import { ListUsersQueryParamsDto } from './request/list-users-query-parmas.request';

@Controller('user/users')
export class ListUsersAction {
  constructor(private queryBus: QueryBus) {}

  @UseGuards(JwtGuard, AdminGuard)
  @Get()
  async invoke(@Query() query: ListUsersQueryParamsDto): Promise<UserCollectionResponseDto> {
    const listQuery = ListUsersQuery.fromQuery(query);
    return await this.queryBus.execute(listQuery);
  }
}
