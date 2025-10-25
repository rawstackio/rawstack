import { Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PrismaService } from './prisma.service';
import { DomainAbstractRoot } from '../../../domain/domain-abstract-root';
import { CacheHandlerInterface } from '../../../domain/cache-handler.interface';
import { RequestIdProvider } from '../../logging/request-id-provider';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';

export default class BaseRepositoryPrisma {
  @Inject(PrismaService)
  protected readonly prisma!: PrismaService;

  @Inject(EventBus)
  protected readonly eventBus!: EventBus;

  @Inject('CacheHandlerInterface')
  protected cache!: CacheHandlerInterface;

  @Inject(RequestIdProvider)
  protected requestIdProvider!: RequestIdProvider;

  protected async eventPrePublishHook(event: DomainEventInterface): Promise<void> {
    event.requestId = this.requestIdProvider.getRequestId();
  }

  protected async saveAndPublish<T extends DomainAbstractRoot>(
    model: T,
    prismaUpsertHandler: (model: T) => Promise<T>,
  ): Promise<T> {
    await prismaUpsertHandler(model);

    // const events = model.getUncommittedEvents();
    const events = model.pullEvents();
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      await this.eventPrePublishHook(event);
      this.eventBus.publish(event);
    }

    const dto = model.getDto();
    if (dto) {
      if (model.isDeleted()) {
        await this.cache.delete(dto.getId(), dto.constructor.name, dto.getVersion());
      } else {
        await this.cache.set(dto);
      }
    }

    return model;
  }
}
