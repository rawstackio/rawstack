import { DtoInterface } from '../application/query/dto/dto.interface';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';

export abstract class DomainAbstractRoot {
  abstract getDto(): DtoInterface | null;
  abstract isDeleted(): boolean;

  private readonly domainEvents: DomainEventInterface[] = [];

  protected apply(event: DomainEventInterface): void {
    this.domainEvents.push(event);
  }

  public pullEvents(): DomainEventInterface[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }
}
