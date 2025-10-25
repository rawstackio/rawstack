import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import { UserWasCreated } from '~/user/domain/model/user/event/user-was-created';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { CreateEmailVerificationTokenCommand } from '~/auth/application/command/token/create-email-verification-token.command';
import { UserUnverifiedEmailWasSet } from '~/user/domain/model/user/event/user-unverified-email-was-set';

@Injectable()
export class TokenSaga {
  @Saga()
  createEmailVerificationToken = (events$: Observable<DomainEventInterface>): Observable<ICommand> => {
    return events$.pipe(
      ofType(UserWasCreated, UserUnverifiedEmailWasSet),
      map((event) => {
        const id = randomUUID();
        return new CreateEmailVerificationTokenCommand(id, event.entityId, event.data.unverifiedEmail);
      }),
    );
  };
}
