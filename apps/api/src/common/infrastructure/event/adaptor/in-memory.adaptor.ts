import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(InMemoryAdaptor.name);

  constructor(private readonly config: ConfigService) {
    const name = this.config.get<string>('SYSTEM_NAME');
    if (!name) {
      throw new Error('SYSTEM_NAME is required to dispatch events');
    }
    this.systemName = name;
  }

  async dispatch(event: DomainEventInterface): Promise<void> {
    try {
      const detail = {
        requestId: event.requestId,
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
    } catch (error) {
      this.logger.error(
        `Error dispatching event in InMemoryAdaptor: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  public clear(): void {
    this.events.length = 0;
  }

  public getEvents(): Event[] {
    return this.events;
  }
}
