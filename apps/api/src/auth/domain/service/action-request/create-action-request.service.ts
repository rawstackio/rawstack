import * as dayjs from 'dayjs';
import { ActionData, ActionRequestModel, ActionType } from '~/auth/domain/model/action-request/action-request.model';
import { ActionRequestRepositoryInterface } from '~/auth/domain/model/action-request/action-request-repository.interface';
import { Id } from '~/common/domain/model/value-object/id';
import { Email } from '~/common/domain/model/value-object/email';

export class CreateActionRequestService {
  constructor(private repository: ActionRequestRepositoryInterface) {}

  async invoke(id: Id, action: ActionType, tokenId: Id, userId: Id, email?: Email): Promise<void> {
    const now = dayjs();
    const data: ActionData = {
      tokenId,
      userId,
      email,
    };
    const model = ActionRequestModel.create(now, id, action, data);

    await this.repository.persist(model);
  }
}
