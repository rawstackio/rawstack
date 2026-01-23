import * as dayjs from 'dayjs';
import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ActionRequestRepositoryInterface } from '~/auth/domain/model/action-request/action-request-repository.interface';
import { ActionRequestModel, ActionData } from '~/auth/domain/model/action-request/action-request.model';
import { CacheHandlerInterface } from '~/common/domain/cache-handler.interface';
import { EntityNotFoundException } from '~/common/domain/exception/entity-not-found.exception';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

@Injectable()
export class ActionRequestRepositoryRedis implements ActionRequestRepositoryInterface {
  constructor(
    protected readonly eventBus: EventBus,
    @Inject('CacheHandlerInterface') protected readonly cacheHandler: CacheHandlerInterface,
  ) {}

  async persist(model: ActionRequestModel): Promise<ActionRequestModel> {
    const events = model.pullEvents();

    await this.cacheHandler.setRaw(ActionRequestModel.getStorageKey(model.id.toString()), JSON.stringify(model), 3600);

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

    // Extract the data - it might be stored with value objects serialized
    const storedData = obj._data;
    const actionData: ActionData = {
      tokenId: new Id(
        typeof storedData.tokenId === 'string' ? storedData.tokenId : storedData.tokenId.value || storedData.tokenId,
      ),
      userId: new Id(
        typeof storedData.userId === 'string' ? storedData.userId : storedData.userId.value || storedData.userId,
      ),
      email: storedData.email
        ? new Email(
            typeof storedData.email === 'string' ? storedData.email : storedData.email.value || storedData.email,
          )
        : undefined,
    };

    // Extract the id - it might be stored as a value object
    const idString = typeof obj._id === 'string' ? obj._id : obj._id.value || obj._id;

    // Use the create method to properly construct value objects
    const model = ActionRequestModel.create(dayjs(obj._createdAt), new Id(idString), obj._action, actionData);

    // Update the status if it's different from PROCESSING
    if (obj._status !== 'PROCESSING') {
      model.updateStatus(dayjs(), obj._status);
    }

    // Clear any events generated during reconstruction
    model.pullEvents();

    return model;
  }
}
