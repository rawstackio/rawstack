import * as dayjs from 'dayjs';
import { ActionData, ActionRequestModel, ActionType } from '~/auth/domain/model/action-request/action-request.model';
import { ActionRequestRepositoryInterface } from '~/auth/domain/model/action-request/action-request-repository.interface';

export class CreateActionRequestService {
  constructor(private repository: ActionRequestRepositoryInterface) {}

  async invoke(id: string, action: ActionType, data: ActionData): Promise<void> {
    const now = dayjs();
    const model = ActionRequestModel.create(now, id, action, data);

    await this.repository.persist(model);
  }
}
