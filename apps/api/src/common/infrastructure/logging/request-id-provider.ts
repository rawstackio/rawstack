import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestIdProvider {
  constructor(protected readonly als: AsyncLocalStorage<{ requestId: string }>) {}

  getRequestId(): string {
    const store = this.als.getStore();
    return store?.requestId ?? '';
  }
}
