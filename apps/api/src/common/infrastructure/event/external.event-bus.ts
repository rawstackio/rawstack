import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Subject, takeUntil } from 'rxjs';
import { EventBus } from '@nestjs/cqrs';
import { DomainEventInterface } from '../../domain/model/event/domain-event.interface';

export interface EventBusAdaptor {
  dispatch(event: DomainEventInterface): void;
}

@Injectable()
export class ExternalEventBus implements OnModuleDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private eventBus: EventBus<DomainEventInterface>,
    @Inject('EventBusAdaptors') private adaptors: EventBusAdaptor[],
  ) {
    this.eventBus.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      // clone the event and filter it before dispatching
      const clonedEvent = { ...event, data: { ...event.data } };

      // Filter data before its gets dispatched to adaptors
      Object.keys(clonedEvent.data).forEach((key) => {
        if (key === 'password') {
          clonedEvent.data[key] = '***';
        }
      });

      this.adaptors.forEach((adaptor) => adaptor.dispatch(clonedEvent));
    });
  }

  onModuleDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
