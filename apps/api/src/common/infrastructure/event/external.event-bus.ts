import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Subject, takeUntil } from 'rxjs';
import { EventBus } from '@nestjs/cqrs';
import { DomainEventInterface } from '../../domain/model/event/domain-event.interface';

export interface EventBusAdaptor {
  dispatch(event: DomainEventInterface): void;
}

@Injectable()
export class ExternalEventBus implements OnModuleDestroy {
  private destroy$ = new Subject<void>();
  private readonly logger = new Logger(ExternalEventBus.name);

  constructor(
    private eventBus: EventBus<DomainEventInterface>,
    @Inject('EventBusAdaptors') private adaptors: EventBusAdaptor[],
  ) {
    this.eventBus.pipe(takeUntil(this.destroy$)).subscribe({
      next: (event) => {
        try {
          // clone the event and filter it before dispatching
          const clonedEvent = { ...event, data: { ...event.data } };

          // Filter data before its gets dispatched to adaptors
          Object.keys(clonedEvent.data).forEach((key) => {
            if (key === 'password') {
              clonedEvent.data[key] = '***';
            }
          });

          this.adaptors.forEach((adaptor) => {
            try {
              adaptor.dispatch(clonedEvent);
            } catch (error) {
              this.logger.error(
                `Error dispatching event to adaptor: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error.stack : undefined,
              );
            }
          });
        } catch (error) {
          this.logger.error(
            `Error processing event in ExternalEventBus: ${error instanceof Error ? error.message : String(error)}`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      },
      error: (error) => {
        this.logger.error(
          `Error in ExternalEventBus subscription: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      },
    });
  }

  onModuleDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
