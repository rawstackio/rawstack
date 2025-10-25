import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';
import { ActionData, ActionType, ActionStatus } from '~/auth/domain/model/action-request/action-request.model';

export class ActionRequestStatusWasUpdated implements DomainEventInterface {
  eventName = 'auth.actionRequest.statusWasUpdated';
  snapshot: DtoInterface | null = null;
  data: Record<string, any>;

  constructor(
    public readonly entityId: string,
    public occurredAt: Date,
    action: ActionType,
    status: ActionStatus,
    data: ActionData,
  ) {
    this.data = {
      action,
      status,
      data,
    };
  }
}
