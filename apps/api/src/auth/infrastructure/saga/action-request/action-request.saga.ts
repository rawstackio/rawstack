import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { UserEmailWasVerified } from '~/user/domain/model/user/event/user-email-was-verified';
import { UpdateTokenActionStatusCommand } from '~/auth/application/command/token/update-token-action-status.command';

@Injectable()
export class ActionRequestSaga {
  @Saga()
  updateTokenActionStatus = (events$: Observable<DomainEventInterface>): Observable<ICommand | null> => {
    return events$.pipe(
      ofType(UserEmailWasVerified),
      map((event) => {
        // @ts-expect-error
        return new UpdateTokenActionStatusCommand(event.requestId, 'COMPLETED');
      }),
    );
  };
}
