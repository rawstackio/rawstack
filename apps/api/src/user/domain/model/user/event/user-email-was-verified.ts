import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';

export class UserEmailWasVerified implements DomainEventInterface {
  public readonly eventName: string = 'user.user.emailWasVerified';
  public readonly data: Record<string, any>;

  constructor(
    public readonly entityId: string,
    public readonly occurredAt: Date,
    public readonly snapshot: DtoInterface,
    public readonly email: string,
  ) {
    this.data = {
      id: this.entityId,
      email: this.email,
      updatedAt: this.occurredAt,
    };
  }
}
