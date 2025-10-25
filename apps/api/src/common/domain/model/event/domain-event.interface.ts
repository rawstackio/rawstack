import { DtoInterface } from '../../../application/query/dto/dto.interface';

export interface DomainEventInterface {
  requestId?: string;
  eventName: string;
  entityId: string;
  occurredAt: Date;
  snapshot: DtoInterface | null;
  data: Record<string, any>;
}
