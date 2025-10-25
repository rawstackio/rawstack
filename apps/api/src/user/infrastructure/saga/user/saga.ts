import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VerifyUserEmailCommand } from '~/user/application/command/user/verify-user-email.command';
import { ActionRequestWasCreated } from '~/auth/domain/model/action-request/event/action-request-was-created';

@Injectable()
export class UserSaga {
  @Saga()
  verifyUserEmail = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(ActionRequestWasCreated),
      map((event) => {
        return new VerifyUserEmailCommand(event.data.data.userId, event.data.data.email);
      }),
    );
  };
}
