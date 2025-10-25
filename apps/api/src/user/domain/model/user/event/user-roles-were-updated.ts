import { UserRoles } from '~/common/domain/enum/user-roles';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';

export class UserRolesWereUpdated implements DomainEventInterface {
  public readonly eventName: string = 'user.user.rolesWereUpdated';
  public readonly data: Record<string, any>;

  constructor(
    public readonly entityId: string,
    public readonly occurredAt: Date,
    public readonly snapshot: DtoInterface,
    public readonly roles: UserRoles[] = [],
  ) {
    this.data = {
      id: this.entityId,
      roles: this.roles,
      updatedAt: this.occurredAt,
    };
  }
}
