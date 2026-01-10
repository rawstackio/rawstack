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

  public merge(model: DomainAbstractRoot): void {
    // save the current events
    const currentEvents = this.pullEvents();

    // copy all properties from the provided model
    Object.assign(this, model);

    // re-apply the saved events
    currentEvents.forEach((event) => this.apply(event));
  }
}
