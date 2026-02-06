import { NotificationStrategy } from './NotificationStrategy';

export class NotificationRegistry {
  private strategies: Map<string, NotificationStrategy> = new Map();

  /**
   * Register a notification strategy
   */
  register(strategy: NotificationStrategy): void {
    if (this.strategies.has(strategy.eventType)) {
      throw new Error(`Strategy for event type '${strategy.eventType}' is already registered`);
    }
    this.strategies.set(strategy.eventType, strategy);
  }

  /**
   * Register multiple strategies at once
   */
  registerAll(strategies: NotificationStrategy[]): void {
    strategies.forEach((strategy) => this.register(strategy));
  }

  /**
   * Get a strategy by event type
   */
  get(eventType: string): NotificationStrategy | undefined {
    return this.strategies.get(eventType);
  }

  /**
   * Check if a strategy exists for the given event type
   */
  has(eventType: string): boolean {
    return this.strategies.has(eventType);
  }

  /**
   * Get all registered event types
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.strategies.keys());
  }
}
