import { Dayjs } from 'dayjs';
import { DomainAbstractRoot } from '~/common/domain/domain-abstract-root';
import { DtoInterface } from '~/common/application/query/dto/dto.interface';
import { ActionRequestWasCreated } from '~/auth/domain/model/action-request/event/action-request-was-created';
import { ActionRequestStatusWasUpdated } from '~/auth/domain/model/action-request/event/action-request-status-was-updated';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

export type ActionType = 'EMAIL_VERIFICATION';
export type ActionStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type ActionData = {
  tokenId: Id;
  userId: Id;
  email?: Email;
};

// Serialized version for events and external systems
export type ActionDataSerialized = {
  tokenId: string;
  userId: string;
  email?: string;
};

export class ActionRequestModel extends DomainAbstractRoot {
  static version = 1;

  constructor(
    protected readonly _id: Id,
    protected _status: ActionStatus,
    protected readonly _action: ActionType,
    protected readonly _createdAt: Dayjs,
    protected readonly _data: ActionData,
  ) {
    super();
  }

  get id(): Id {
    return this._id;
  }

  get status(): ActionStatus {
    return this._status;
  }

  get action(): ActionType {
    return this._action;
  }

  get createdAt(): Dayjs {
    return this._createdAt;
  }

  get data(): ActionData {
    return this._data;
  }
  
  private serializeData(): ActionDataSerialized {
    return {
      tokenId: this._data.tokenId.toString(),
      userId: this._data.userId.toString(),
      email: this._data.email?.toString(),
    };
  }

  static create(createdAt: Dayjs, id: Id, action: ActionType, data: ActionData): ActionRequestModel {
    const token = new ActionRequestModel(id, 'PROCESSING', action, createdAt, data);
    token.apply(new ActionRequestWasCreated(
      id.toString(), 
      createdAt.toDate(), 
      action, 
      'PROCESSING', 
      token.serializeData()
    ));

    return token;
  }

  updateStatus(updatedAt: Dayjs, status: ActionStatus): ActionRequestModel {
    this._status = status;
    this.apply(new ActionRequestStatusWasUpdated(
      this.id.toString(), 
      updatedAt.toDate(), 
      this.action, 
      status, 
      this.serializeData()
    ));

    return this;
  }

  getDto(): DtoInterface | null {
    return null;
  }

  static getStorageKey(id: string): string {
    return `ActionRequestModel:${ActionRequestModel.version}:${id}`;
  }

  isDeleted(): boolean {
    return false;
  }
}
