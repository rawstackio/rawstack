import { QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './get-user.query';
import { UserResponseDto } from './dto/user.response-dto';
import { UserResponseBuilder } from './dto/user.response-builder';

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler {
  constructor(private builder: UserResponseBuilder) {}

  async execute(command: GetUserQuery): Promise<UserResponseDto> {
    const { id } = command;
    return await this.builder.build(id);
  }
}
