import { ActionStatus, ActionType } from '~/auth/domain/model/action-request/action-request.model';

export type ActionRequestResponseDto = {
  id: string;
  action: ActionType;
  status: ActionStatus;
};
