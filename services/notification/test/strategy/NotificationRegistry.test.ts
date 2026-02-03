import { NotificationRegistry } from '../../src/strategy/NotificationRegistry';
import { NotificationStrategy, NotificationContext, NotificationResult } from '../../src/strategy/NotificationStrategy';
import { EventBridgeEvent } from 'aws-lambda';

// Mock strategy implementation
class MockStrategy implements NotificationStrategy {
  constructor(public readonly eventType: string) {}

  async execute(event: EventBridgeEvent<string, unknown>, context: NotificationContext): Promise<NotificationResult> {
    return {
      success: true,
      message: 'Mock notification sent',
      channelResults: [],
    };
  }
}

describe('NotificationRegistry', () => {
  let registry: NotificationRegistry;

  beforeEach(() => {
    registry = new NotificationRegistry();
  });

  describe('register', () => {
    it('should register a strategy', () => {
      const strategy = new MockStrategy('test.event.type');

      registry.register(strategy);

      expect(registry.has('test.event.type')).toBe(true);
    });

    it('should throw error when registering duplicate event type', () => {
      const strategy1 = new MockStrategy('test.event.type');
      const strategy2 = new MockStrategy('test.event.type');

      registry.register(strategy1);

      expect(() => registry.register(strategy2)).toThrow(
        "Strategy for event type 'test.event.type' is already registered",
      );
    });
  });

  describe('registerAll', () => {
    it('should register multiple strategies', () => {
      const strategies = [
        new MockStrategy('event.type.one'),
        new MockStrategy('event.type.two'),
        new MockStrategy('event.type.three'),
      ];

      registry.registerAll(strategies);

      expect(registry.has('event.type.one')).toBe(true);
      expect(registry.has('event.type.two')).toBe(true);
      expect(registry.has('event.type.three')).toBe(true);
    });

    it('should throw error when registering duplicate in batch', () => {
      const strategies = [new MockStrategy('event.type.one'), new MockStrategy('event.type.one')];

      expect(() => registry.registerAll(strategies)).toThrow(
        "Strategy for event type 'event.type.one' is already registered",
      );
    });
  });

  describe('get', () => {
    it('should return registered strategy', () => {
      const strategy = new MockStrategy('test.event.type');
      registry.register(strategy);

      const result = registry.get('test.event.type');

      expect(result).toBe(strategy);
    });

    it('should return undefined for unregistered event type', () => {
      const result = registry.get('unknown.event.type');

      expect(result).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for registered event type', () => {
      const strategy = new MockStrategy('test.event.type');
      registry.register(strategy);

      expect(registry.has('test.event.type')).toBe(true);
    });

    it('should return false for unregistered event type', () => {
      expect(registry.has('unknown.event.type')).toBe(false);
    });
  });

  describe('getRegisteredEventTypes', () => {
    it('should return empty array when no strategies registered', () => {
      expect(registry.getRegisteredEventTypes()).toEqual([]);
    });

    it('should return all registered event types', () => {
      registry.register(new MockStrategy('event.type.one'));
      registry.register(new MockStrategy('event.type.two'));

      const eventTypes = registry.getRegisteredEventTypes();

      expect(eventTypes).toHaveLength(2);
      expect(eventTypes).toContain('event.type.one');
      expect(eventTypes).toContain('event.type.two');
    });
  });
});
