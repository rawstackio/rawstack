import { QueryHandler } from '@nestjs/cqrs';
import { ItemResponseDtoInterface } from '~/common/application/query/dto/item-response-dto.interface';
import { GetTokenQuery } from './get-token.query';
import { TokenResponseDto } from '~/auth/application/query/token/dto/token.response-dto';
import { TokenResponseBuilder } from '~/auth/application/query/token/dto/token.response-builder';

@QueryHandler(GetTokenQuery)
export class GetTokenQueryHandler {
  constructor(private responseBuilder: TokenResponseBuilder) {}

  async execute(query: GetTokenQuery): Promise<ItemResponseDtoInterface<TokenResponseDto>> {
    const { id, email } = query;

    return await this.responseBuilder.build(id, email);
  }
}
