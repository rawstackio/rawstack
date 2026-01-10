import { Injectable, Logger } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VerifyUserEmailCommand } from '~/user/application/command/user/verify-user-email.command';
import { ActionRequestWasCreated } from '~/auth/domain/model/action-request/event/action-request-was-created';
import { mapWithRequestId } from '~/common/infrastructure/cqrs/operators/with-request-id.operator';

@Injectable()
export class UserSaga {
  private readonly logger = new Logger(UserSaga.name);

  @Saga()
  verifyUserEmail = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(ActionRequestWasCreated),
      mapWithRequestId((event) => {
        return new VerifyUserEmailCommand(event.data.data.userId, event.data.data.email);
      }),
      catchError((error) => {
        this.logger.error(`Error in UserSaga.verifyUserEmail: ${error.message}`, error.stack);
        return EMPTY;
      }),
    );
  };
}
