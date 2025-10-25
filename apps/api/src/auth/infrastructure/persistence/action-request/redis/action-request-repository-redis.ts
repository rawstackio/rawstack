import * as dayjs from 'dayjs';
import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ActionRequestRepositoryInterface } from '~/auth/domain/model/action-request/action-request-repository.interface';
import { ActionRequestModel } from '~/auth/domain/model/action-request/action-request.model';
import { CacheHandlerInterface } from '~/common/domain/cache-handler.interface';
import { EntityNotFoundException } from '~/common/domain/exception/entity-not-found.exception';

@Injectable()
export class ActionRequestRepositoryRedis implements ActionRequestRepositoryInterface {
  constructor(
    protected readonly eventBus: EventBus,
    @Inject('CacheHandlerInterface') protected readonly cacheHandler: CacheHandlerInterface,
  ) {}

  async persist(model: ActionRequestModel): Promise<ActionRequestModel> {
    const events = model.pullEvents();

    await this.cacheHandler.setRaw(ActionRequestModel.getStorageKey(model.id), JSON.stringify(model), 3600);

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      this.eventBus.publish(event);
    }

    return model;
  }

  async findById(id: string): Promise<ActionRequestModel> {
    const data = await this.cacheHandler.getRaw(ActionRequestModel.getStorageKey(id));
    if (!data) {
      throw new EntityNotFoundException(`Could not find entity with id '${id}'`);
    }

    const obj = JSON.parse(data);
    return new ActionRequestModel(obj.id, obj.status, obj.action, dayjs(obj.createdAt), obj.data);
  }
}
