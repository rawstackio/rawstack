import { ActionStatus } from '~/auth/domain/model/action-request/action-request.model';

export class UpdateTokenActionStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: ActionStatus,
  ) {}
}
