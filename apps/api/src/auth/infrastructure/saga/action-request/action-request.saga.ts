import { Injectable, Logger } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { UserEmailWasVerified } from '~/user/domain/model/user/event/user-email-was-verified';
import { UpdateTokenActionStatusCommand } from '~/auth/application/command/token/update-token-action-status.command';
import { mapWithRequestId } from '~/common/infrastructure/cqrs/operators/with-request-id.operator';

@Injectable()
export class ActionRequestSaga {
  private readonly logger = new Logger(ActionRequestSaga.name);

  @Saga()
  updateTokenActionStatus = (events$: Observable<DomainEventInterface>): Observable<ICommand | null> => {
    return events$.pipe(
      ofType(UserEmailWasVerified),
      mapWithRequestId((event) => {
        // @ts-expect-error - Using event.requestId as the command ID temporarily until proper ID mapping is implemented
        return new UpdateTokenActionStatusCommand(event.requestId, 'COMPLETED');
      }),
      catchError((error) => {
        this.logger.error(`Error in ActionRequestSaga.updateTokenActionStatus: ${error.message}`, error.stack);
        return EMPTY;
      }),
    );
  };
}
