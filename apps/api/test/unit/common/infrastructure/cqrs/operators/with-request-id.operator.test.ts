import { Subject } from 'rxjs';
import { mapWithRequestId } from '~/common/infrastructure/cqrs/operators/with-request-id.operator';
import { DomainEventInterface } from '~/common/domain/model/event/domain-event.interface';
import { ICommand } from '@nestjs/cqrs';

// Mock command for testing
class TestCommand implements ICommand {
  constructor(public readonly data: string) {}
}

// Mock event for testing
class TestEvent implements DomainEventInterface {
  constructor(
    public readonly entityId: string,
    public readonly requestId: string,
    public readonly data: any,
  ) {}

  eventName = 'TestEvent';
  occurredAt = new Date();
  snapshot = null;
}

describe('mapWithRequestId operator', () => {
  let events$: Subject<TestEvent>;

  beforeEach(() => {
    events$ = new Subject();
  });

  afterEach(() => {
    events$.complete();
  });

  it('should automatically attach requestId from event to command', (done) => {
    const testRequestId = 'request-id-123';
    const testData = 'test-data';

    const commands$ = events$.pipe(mapWithRequestId((event: TestEvent) => new TestCommand(event.data.value)));

    commands$.subscribe({
      next: (command: any) => {
        expect(command).toBeInstanceOf(TestCommand);
        expect(command.data).toBe(testData);
        expect(command.requestId).toBe(testRequestId);
        done();
      },
      error: done.fail,
    });

    const event = new TestEvent('entity-1', testRequestId, { value: testData });
    events$.next(event);
  });

  it('should handle undefined requestId gracefully', (done) => {
    const testData = 'test-data';

    const commands$ = events$.pipe(mapWithRequestId((event: TestEvent) => new TestCommand(event.data.value)));

    commands$.subscribe({
      next: (command: any) => {
        expect(command).toBeInstanceOf(TestCommand);
        expect(command.data).toBe(testData);
        expect(command.requestId).toBeUndefined();
        done();
      },
      error: done.fail,
    });

    const event = new TestEvent('entity-1', undefined as any, { value: testData });
    events$.next(event);
  });

  it('should work with multiple events in sequence', (done) => {
    const results: any[] = [];
    const expectedCount = 3;

    const commands$ = events$.pipe(mapWithRequestId((event: TestEvent) => new TestCommand(event.data.value)));

    commands$.subscribe({
      next: (command: any) => {
        results.push({
          data: command.data,
          requestId: command.requestId,
        });

        if (results.length === expectedCount) {
          expect(results[0].requestId).toBe('request-1');
          expect(results[1].requestId).toBe('request-2');
          expect(results[2].requestId).toBe('request-3');
          done();
        }
      },
      error: done.fail,
    });

    events$.next(new TestEvent('entity-1', 'request-1', { value: 'data-1' }));
    events$.next(new TestEvent('entity-2', 'request-2', { value: 'data-2' }));
    events$.next(new TestEvent('entity-3', 'request-3', { value: 'data-3' }));
  });
});
