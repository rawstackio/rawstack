import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';

export class UserWasDeleted implements DomainEventInterface {
  public readonly eventName: string = 'user.user.emailWasDeleted';
  public readonly data: Record<string, any> = {};

  constructor(
    public readonly entityId: string,
    public readonly occurredAt: Date,
    public readonly snapshot: DtoInterface,
  ) {
    this.data = {
      id: this.entityId,
      deletedAt: this.occurredAt,
    };
  }
}
