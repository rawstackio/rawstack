import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventBusAdaptor } from '~/common/infrastructure/event/external.event-bus';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';

type Event = Readonly<{
  Source: string;
  DetailType: string;
  Detail: string;
  Time: Date | string;
}>;

@Injectable()
export class InMemoryAdaptor implements EventBusAdaptor {
  private readonly events: Event[] = [];
  private readonly systemName: string;

  constructor(private readonly config: ConfigService) {
    const name = this.config.get<string>('SYSTEM_NAME');
    if (!name) {
      throw new Error('SYSTEM_NAME is required to dispatch events');
    }
    this.systemName = name;
  }

  async dispatch(event: DomainEventInterface): Promise<void> {
    const detail = {
      aggregateId: event.entityId,
      entity: event.snapshot,
      data: event.data,
    };

    const params: Event = {
      Source: this.systemName,
      DetailType: event.eventName,
      Detail: JSON.stringify(detail),
      Time: event.occurredAt,
    };

    this.events.push(params);
  }

  public clear(): void {
    this.events.length = 0;
  }

  public getEvents(): Event[] {
    return this.events;
  }
}
