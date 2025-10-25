import * as dayjs from 'dayjs';
import { ActionRequestRepositoryInterface } from '~/auth/domain/model/action-request/action-request-repository.interface';
import { ActionStatus } from '~/auth/domain/model/action-request/action-request.model';

export class UpdateActionRequestService {
  constructor(private repo: ActionRequestRepositoryInterface) {}

  async invoke(id: string, status: ActionStatus): Promise<void> {
    const now = dayjs();
    const model = await this.repo.findById(id);

    model.updateStatus(now, status);

    await this.repo.persist(model);
  }
}
