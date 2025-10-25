import { ActionRequestModel } from '~/auth/domain/model/action-request/action-request.model';

export interface ActionRequestRepositoryInterface {
  persist(token: ActionRequestModel): Promise<ActionRequestModel>;
  findById(id: string): Promise<ActionRequestModel>;
}
