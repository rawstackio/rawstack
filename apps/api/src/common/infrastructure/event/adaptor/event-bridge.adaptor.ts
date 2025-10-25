import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { EventBusAdaptor } from '../external.event-bus';
import { DomainEventInterface } from '../../../domain/model/event/domain-event.interface';

@Injectable()
export class EventBridgeAdaptor implements EventBusAdaptor {
  private readonly client: EventBridgeClient;
  private readonly logger = new Logger('EventBridgeAdaptor');

  constructor(private config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION');
    this.client = new EventBridgeClient({
      region,
    });
  }

  dispatch(event: DomainEventInterface): void {
    const systemName = this.config.get<string>('SYSTEM_NAME');

    const detail = {
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
    this.client.send(eventBridgeCommand).catch((err) => this.logger.error(err));
  }
}
