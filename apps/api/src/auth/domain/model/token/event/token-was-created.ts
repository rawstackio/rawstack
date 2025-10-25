import { Dayjs } from 'dayjs';
import { TokenModelType } from '../token.model';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';

export class TokenWasCreated implements DomainEventInterface {
  eventName = 'auth.token.wasCreated';
  snapshot: DtoInterface | null = null;
  data: Record<string, any>;

  constructor(
    public readonly entityId: string,
    public occurredAt: Date,
    userId: string,
    expiresAt: Dayjs,
    type: TokenModelType,
    email?: string,
    token?: string,
  ) {
    this.data = {
      id: this.entityId,
      userId: userId,
      createdAt: occurredAt,
      expiresAt: expiresAt.toDate(),
      type,
      email,
      token,
    };
  }
}
