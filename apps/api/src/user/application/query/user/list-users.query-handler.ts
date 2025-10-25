import { QueryHandler } from '@nestjs/cqrs';
import { ListUsersQuery } from './list-users.query';
import { UserCollectionResponseDto } from './dto/user-collection.response-dto';
import { UserCollectionResponseBuilder } from './dto/user-collection.response-builder';

@QueryHandler(ListUsersQuery)
export class ListUsersQueryHandler {
  constructor(private responseBuilder: UserCollectionResponseBuilder) {}

  async execute(query: ListUsersQuery): Promise<UserCollectionResponseDto> {
    return this.responseBuilder.build(query.page, query.perPage, query.q);
  }
}
