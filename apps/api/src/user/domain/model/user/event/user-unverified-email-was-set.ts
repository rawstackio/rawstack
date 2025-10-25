import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';

export class UserUnverifiedEmailWasSet implements DomainEventInterface {
  public readonly eventName: string = 'user.user.unverifiedEmailWasSet';
  public readonly data: Record<string, any>;

  constructor(
    public readonly entityId: string,
    public readonly occurredAt: Date,
    public readonly snapshot: DtoInterface,
    unverifiedEmail: string,
  ) {
    this.data = {
      id: this.entityId,
      unverifiedEmail: unverifiedEmail,
      updatedAt: this.occurredAt,
    };
  }
}
