import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandBus, ICommand } from '@nestjs/cqrs';
import { AsyncLocalStorage } from 'async_hooks';
import { LoggedInUser } from '~/common/domain/logged-in-user';

@Injectable()
export class AsyncContextCommandBus implements OnModuleInit {
  private originalExecute: any;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly als: AsyncLocalStorage<{ requestId: string; actor: LoggedInUser | null }>,
  ) {}

  onModuleInit() {
    // Wrap the original execute method to restore async context
    this.originalExecute = this.commandBus.execute.bind(this.commandBus);
    this.commandBus.execute = this.executeWithContext.bind(this);
  }

  private async executeWithContext<T extends ICommand = ICommand>(command: T): Promise<any> {
    // Check if command has requestId (from saga or event)
    const requestId = (command as any).requestId;

    if (requestId) {
      // Get current store to preserve actor if available
      const currentStore = this.als.getStore();

      // Create a new async context with the requestId from the command
      const store = {
        requestId,
        actor: currentStore?.actor ?? null, // Preserve actor if available
      };

      return this.als.run(store, () => {
        return this.originalExecute(command);
      });
    }

    // If no requestId, execute normally (will use existing context if available)
    return this.originalExecute(command);
  }
}
