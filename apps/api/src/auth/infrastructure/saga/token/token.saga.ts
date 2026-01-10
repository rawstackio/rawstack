import { Injectable, Logger } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import { UserWasCreated } from '~/user/domain/model/user/event/user-was-created';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { CreateEmailVerificationTokenCommand } from '~/auth/application/command/token/create-email-verification-token.command';
import { UserUnverifiedEmailWasSet } from '~/user/domain/model/user/event/user-unverified-email-was-set';
import { mapWithRequestId } from '~/common/infrastructure/cqrs/operators/with-request-id.operator';

@Injectable()
export class TokenSaga {
  private readonly logger = new Logger(TokenSaga.name);

  @Saga()
  createEmailVerificationToken = (events$: Observable<DomainEventInterface>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserWasCreated, UserUnverifiedEmailWasSet),
      mapWithRequestId((event) => {
        const id = randomUUID();
        return new CreateEmailVerificationTokenCommand(id, event.entityId, event.data.unverifiedEmail);
      }),
      catchError((error) => {
        this.logger.error(`Error in TokenSaga.createEmailVerificationToken: ${error.message}`, error.stack);
        return EMPTY;
      }),
    );
  };
}
