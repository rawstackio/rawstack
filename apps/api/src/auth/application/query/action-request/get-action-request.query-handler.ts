import { QueryHandler } from '@nestjs/cqrs';
import { ItemResponseDtoInterface } from '~/common/application/query/dto/item-response-dto.interface';
import { GetActionRequestQuery } from '~/auth/application/query/action-request/get-action-request.query';
import { ActionRequestResponseDto } from '~/auth/application/query/action-request/dto/action-request.response-dto';
import { ActionRequestResponseBuilder } from '~/auth/application/query/action-request/dto/action-request.response-builder';

@QueryHandler(GetActionRequestQuery)
export class GetActionRequestQueryHandler {
  constructor(private builder: ActionRequestResponseBuilder) {}

  async execute(query: GetActionRequestQuery): Promise<ItemResponseDtoInterface<ActionRequestResponseDto>> {
    return await this.builder.build(query.id);
  }
}
