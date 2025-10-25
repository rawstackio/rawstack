import { Dayjs } from 'dayjs';
import { DomainAbstractRoot } from '~/common/domain/domain-abstract-root';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';
import { ActionRequestWasCreated } from '~/auth/domain/model/action-request/event/action-request-was-created';
import { ActionRequestStatusWasUpdated } from '~/auth/domain/model/action-request/event/action-request-status-was-updated';

export type ActionType = 'EMAIL_VERIFICATION';
export type ActionStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type ActionData = {
  tokenId: string;
  userId: string;
  email?: string;
};

export class ActionRequestModel extends DomainAbstractRoot {
  static version = 1;

  constructor(
    public id: string,
    public status: ActionStatus,
    public action: ActionType,
    public createdAt: Dayjs,
    public data: ActionData,
  ) {
    super();
  }

  static create(createdAt: Dayjs, id: string, action: ActionType, data: ActionData): ActionRequestModel {
    const token = new ActionRequestModel(id, 'PROCESSING', action, createdAt, data);
    token.apply(new ActionRequestWasCreated(id, createdAt.toDate(), action, 'PROCESSING', data));

    return token;
  }

  updateStatus(updatedAt: Dayjs, status: ActionStatus): ActionRequestModel {
    this.status = status;
    this.apply(new ActionRequestStatusWasUpdated(this.id, updatedAt.toDate(), this.action, status, this.data));

    return this;
  }

  getDto(): DtoInterface | null {
    return null;
  }

  // @todo: maybe this is not suited to being on the model, storage bits are outside of the domain...
  // get storageKey(): string {
  //   return `ActionRequestModel:${ActionRequestModel.version}:${this.id}`;
  // }

  static getStorageKey(id: string): string {
    return `ActionRequestModel:${ActionRequestModel.version}:${id}`;
  }

  isDeleted(): boolean {
    return false;
  }
}
