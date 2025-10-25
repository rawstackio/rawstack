import { UserRoles } from '~/common/domain/enum/user-roles';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';

export class UserWasCreated implements DomainEventInterface {
  eventName: string = 'user.user.wasCreated';
  data: Record<string, any>;

  constructor(
    public readonly entityId: string,
    public readonly occurredAt: Date,
    public readonly snapshot: DtoInterface,
    public readonly email: string,
    public readonly roles: UserRoles[] = [],
  ) {
    this.data = {
      id: this.entityId,
      email: this.email,
      unverifiedEmail: this.email,
      roles: this.roles,
      createdAt: this.occurredAt,
    };
  }
}
