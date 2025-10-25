import { TokenModelType } from '../token.model';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';

export class TokenWasUsed implements DomainEventInterface {
  eventName = 'auth.token.wasUsed';
  snapshot: DtoInterface | null = null;
  data: Record<string, any>;

  constructor(
    public readonly entityId: string,
    public occurredAt: Date,
    public readonly userId: string,
    type: TokenModelType,
  ) {
    this.data = {
      entityId: this.entityId,
      userId: this.userId,
      createdAt: occurredAt,
      type,
    };
  }
}
