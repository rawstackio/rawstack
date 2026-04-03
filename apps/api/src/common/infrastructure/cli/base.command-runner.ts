import { Inject } from '@nestjs/common';
import { CommandRunner } from 'nest-commander';
import { AsyncLocalStorage } from 'async_hooks';
import { LoggedInUser } from '~/common/domain/logged-in-user';
import { randomUUID } from 'crypto';
import { Id } from '~/common/domain/model/value-object/id';

export abstract class BaseCommandRunner extends CommandRunner {
  @Inject(AsyncLocalStorage)
  protected readonly als!: AsyncLocalStorage<{ requestId: string; actor: LoggedInUser | null }>;

  abstract execute(passedParams: string[], options?: Record<string, unknown>): Promise<void>;

  async run(passedParams: string[], options?: Record<string, unknown>): Promise<void> {
    const store = {
      requestId: randomUUID(),
      actor: new LoggedInUser(Id.create(), ['ADMIN']),
    };

    await this.als.run(store, async () => {
      try {
        await this.execute(passedParams, options);
      } catch (error) {
        this.handleError(error);
        process.exit(1);
      }
    });
  }

  protected handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${message}`);
  }
}
