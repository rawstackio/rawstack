import { ICommand } from '@nestjs/cqrs';
import { map } from 'rxjs/operators';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';

/**
 * RxJS operator that automatically propagates requestId from domain events to commands.
 * Use this in sagas to avoid manually setting requestId on each command.
 *
 * @example
 * ```typescript
 * @Saga()
 * mySaga = (events$: Observable<DomainEventInterface>): Observable<ICommand> => {
 *   return events$.pipe(
 *     ofType(MyEvent),
 *     mapWithRequestId((event) => new MyCommand(event.data)),
 *   );
 * };
 * ```
 */
export function mapWithRequestId<TEvent extends DomainEventInterface, TCommand extends ICommand>(
  commandFactory: (event: TEvent) => TCommand,
) {
  return map<TEvent, TCommand>((event: TEvent) => {
    const command = commandFactory(event);
    // Automatically attach requestId from event to command
    (command as any).requestId = event.requestId;
    return command;
  });
}
