import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { AsyncLocalStorage } from 'async_hooks';
import { AsyncContextCommandBus } from '~/common/infrastructure/cqrs/async-context-command-bus';

// Mock command for testing
class TestCommand {
  constructor(public readonly data: string) {}
}

describe('AsyncContextCommandBus', () => {
  let asyncContextCommandBus: AsyncContextCommandBus;
  let commandBus: CommandBus;
  let als: AsyncLocalStorage<{ requestId: string; actor: any }>;
  let originalExecute: jest.Mock;

  beforeEach(async () => {
    als = new AsyncLocalStorage();
    originalExecute = jest.fn().mockResolvedValue('result');

    const mockCommandBus = {
      execute: originalExecute,
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: AsyncLocalStorage,
          useValue: als,
        },
        AsyncContextCommandBus,
      ],
    }).compile();

    commandBus = module.get<CommandBus>(CommandBus);
    asyncContextCommandBus = module.get<AsyncContextCommandBus>(AsyncContextCommandBus);

    // Initialize the wrapper
    asyncContextCommandBus.onModuleInit();
  });

  it('should be defined', () => {
    expect(asyncContextCommandBus).toBeDefined();
  });

  it('should wrap commandBus.execute on module init', () => {
    expect(commandBus.execute).not.toBe(originalExecute);
  });

  it('should execute command without requestId normally', async () => {
    const command = new TestCommand('test');
    await commandBus.execute(command);

    expect(originalExecute).toHaveBeenCalledWith(command);
  });

  it('should create async context when command has requestId', async () => {
    const testRequestId = 'test-request-id-123';
    const command = new TestCommand('test');
    (command as any).requestId = testRequestId;

    // Execute with a spy to capture the async context
    let capturedRequestId: string | undefined;
    originalExecute.mockImplementation(() => {
      const store = als.getStore();
      capturedRequestId = store?.requestId;
      return Promise.resolve('result');
    });

    await commandBus.execute(command);

    expect(capturedRequestId).toBe(testRequestId);
    expect(originalExecute).toHaveBeenCalledWith(command);
  });

  it('should preserve existing actor in async context if available', async () => {
    const testRequestId = 'test-request-id-456';
    const testActor = { id: 'user-123' };
    const command = new TestCommand('test');
    (command as any).requestId = testRequestId;

    // Run in an existing context with an actor
    await als.run({ requestId: 'old-request', actor: testActor }, async () => {
      let capturedStore: any;
      originalExecute.mockImplementation(() => {
        capturedStore = als.getStore();
        return Promise.resolve('result');
      });

      await commandBus.execute(command);

      expect(capturedStore.requestId).toBe(testRequestId);
      expect(capturedStore.actor).toBe(testActor);
    });
  });

  it('should handle commands without async context gracefully', async () => {
    const command = new TestCommand('test');

    // Ensure we're outside any async context
    const storeBefore = als.getStore();
    expect(storeBefore).toBeUndefined();

    await commandBus.execute(command);

    const storeAfter = als.getStore();
    expect(storeAfter).toBeUndefined();
    expect(originalExecute).toHaveBeenCalledWith(command);
  });
});
