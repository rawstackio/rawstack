import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { EventBusAdaptor } from '../external.event-bus';
import { DomainEventInterface } from '../../../domain/model/event/domain-event.interface';

@Injectable()
export class EventBridgeAdaptor implements EventBusAdaptor {
  private readonly client: EventBridgeClient;
  private readonly logger = new Logger(EventBridgeAdaptor.name);

  constructor(private config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION');
    this.client = new EventBridgeClient({
      region,
    });
  }

  dispatch(event: DomainEventInterface): void {
    try {
      const systemName = this.config.get<string>('SYSTEM_NAME');

      const detail = {
        requestId: event.requestId,
        aggregateId: event.entityId,
        entity: event.snapshot,
        data: event.data,
      };

      const params = {
        Entries: [
          {
            Source: systemName,
            DetailType: event.eventName,
            Detail: JSON.stringify(detail),
            Time: event.occurredAt,
          },
        ],
        EventBusName: 'default',
      };

      const eventBridgeCommand = new PutEventsCommand(params);

      this.logger.log('Event dispatched to Eventbridge', params);
      this.client.send(eventBridgeCommand).catch((err) => {
        this.logger.error(
          `Error sending event to EventBridge: ${err instanceof Error ? err.message : String(err)}`,
          err instanceof Error ? err.stack : undefined,
        );
      });
    } catch (error) {
      this.logger.error(
        `Error in EventBridgeAdaptor.dispatch: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
