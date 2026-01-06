import { Inject, Injectable } from '@nestjs/common';
import { ItemResponseDtoInterface } from '~/common/application/query/dto/item-response-dto.interface';
import { ActionRequestRepositoryInterface } from '~/auth/domain/model/action-request/action-request-repository.interface';
import { ActionRequestResponseDto } from '~/auth/application/query/action-request/dto/action-request.response-dto';

@Injectable()
export class ActionRequestResponseBuilder {
  constructor(@Inject('ActionRequestRepositoryInterface') private repo: ActionRequestRepositoryInterface) {}

  async build(id: string): Promise<ItemResponseDtoInterface<ActionRequestResponseDto>> {
    const item = await this.repo.findById(id);

    return {
      item: {
        id: item.id.toString(),
        action: item.action,
        status: item.status,
      },
    };
  }
}
