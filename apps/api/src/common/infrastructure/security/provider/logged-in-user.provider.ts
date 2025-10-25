import { AsyncLocalStorage } from 'async_hooks';
import { LoggedInUser } from '../../../domain/logged-in-user';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggedInUserProvider {
  constructor(protected readonly als: AsyncLocalStorage<{ actor: LoggedInUser | null }>) {}

  getLoggedInUser(): LoggedInUser | null {
    const store = this.als.getStore();
    return store ? store.actor : null;
  }
}
