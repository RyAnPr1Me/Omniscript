import { debug } from "../debug";

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  payload: any;
  metadata: Record<string, any>;
  timestamp: number;
  version: number;
  causationId?: string;
  correlationId?: string;
}

export interface EventStore {
  append(events: DomainEvent[]): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;
  getAllEvents(fromTimestamp?: number): Promise<DomainEvent[]>;
  getEventsByType(eventType: string): Promise<DomainEvent[]>;
}

export interface Snapshot<T> {
  aggregateId: string;
  aggregateType: string;
  data: T;
  version: number;
  timestamp: number;
}

export interface SnapshotStore {
  save<T>(snapshot: Snapshot<T>): Promise<void>;
  get<T>(aggregateId: string): Promise<Snapshot<T> | null>;
}

export interface EventHandler<T = any> {
  eventType: string;
  handle(event: DomainEvent): Promise<T>;
}

export class InMemoryEventStore implements EventStore {
  private events: DomainEvent[] = [];
  private eventsByAggregate: Map<string, DomainEvent[]> = new Map();
  private eventsByType: Map<string, DomainEvent[]> = new Map();

  async append(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      this.events.push(event);

      // Index by aggregate
      if (!this.eventsByAggregate.has(event.aggregateId)) {
        this.eventsByAggregate.set(event.aggregateId, []);
      }
      this.eventsByAggregate.get(event.aggregateId)!.push(event);

      // Index by type
      if (!this.eventsByType.has(event.type)) {
        this.eventsByType.set(event.type, []);
      }
      this.eventsByType.get(event.type)!.push(event);

      debug.debug(
        "EventSourcing",
        `Event appended: ${event.type} for aggregate ${event.aggregateId}`,
      );
    }
  }

  async getEvents(
    aggregateId: string,
    fromVersion: number = 0,
  ): Promise<DomainEvent[]> {
    const events = this.eventsByAggregate.get(aggregateId) || [];
    return events.filter((event) => event.version >= fromVersion);
  }

  async getAllEvents(fromTimestamp: number = 0): Promise<DomainEvent[]> {
    return this.events.filter((event) => event.timestamp >= fromTimestamp);
  }

  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    return this.eventsByType.get(eventType) || [];
  }
}

export class InMemorySnapshotStore implements SnapshotStore {
  private snapshots: Map<string, Snapshot<any>> = new Map();

  async save<T>(snapshot: Snapshot<T>): Promise<void> {
    this.snapshots.set(snapshot.aggregateId, snapshot);
    debug.debug(
      "EventSourcing",
      `Snapshot saved for aggregate ${snapshot.aggregateId} at version ${snapshot.version}`,
    );
  }

  async get<T>(aggregateId: string): Promise<Snapshot<T> | null> {
    return this.snapshots.get(aggregateId) || null;
  }
}

export abstract class AggregateRoot<T = any> {
  protected id: string;
  protected version: number = 0;
  protected uncommittedEvents: DomainEvent[] = [];

  constructor(id: string) {
    this.id = id;
  }

  abstract getTypeName(): string;
  abstract applyEvent(event: DomainEvent): void;

  getId(): string {
    return this.id;
  }

  getVersion(): number {
    return this.version;
  }

  protected addEvent(
    eventType: string,
    payload: any,
    metadata: Record<string, any> = {},
  ): void {
    const event: DomainEvent = {
      id: this.generateEventId(),
      type: eventType,
      aggregateId: this.id,
      aggregateType: this.getTypeName(),
      payload,
      metadata,
      timestamp: Date.now(),
      version: this.version + 1,
    };

    this.uncommittedEvents.push(event);
    this.applyEvent(event);
    this.version = event.version;
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  loadFromHistory(events: DomainEvent[]): void {
    events.forEach((event) => {
      this.applyEvent(event);
      this.version = event.version;
    });
  }

  createSnapshot(): Snapshot<T> {
    return {
      aggregateId: this.id,
      aggregateType: this.getTypeName(),
      data: this.getState(),
      version: this.version,
      timestamp: Date.now(),
    };
  }

  loadFromSnapshot(snapshot: Snapshot<T>): void {
    this.loadState(snapshot.data);
    this.version = snapshot.version;
  }

  protected abstract getState(): T;
  protected abstract loadState(state: T): void;

  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private projections: Map<string, (event: DomainEvent) => Promise<void>> =
    new Map();

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    debug.info(
      "EventSourcing",
      `Handler subscribed to event type: ${eventType}`,
    );
  }

  addProjection(
    name: string,
    projectionHandler: (event: DomainEvent) => Promise<void>,
  ): void {
    this.projections.set(name, projectionHandler);
    debug.info("EventSourcing", `Projection added: ${name}`);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];

    // Execute handlers
    const handlerPromises = handlers.map((handler) => {
      return handler.handle(event).catch((error) => {
        debug.error(
          "EventSourcing",
          `Handler error for event ${event.type}:`,
          error,
        );
      });
    });

    // Execute projections
    const projectionPromises = Array.from(this.projections.values()).map(
      (projection) => {
        return projection(event).catch((error) => {
          debug.error(
            "EventSourcing",
            `Projection error for event ${event.type}:`,
            error,
          );
        });
      },
    );

    await Promise.all([...handlerPromises, ...projectionPromises]);
    debug.debug("EventSourcing", `Event published: ${event.type}`);
  }
}

export class Repository<T extends AggregateRoot> {
  constructor(
    private eventStore: EventStore,
    private snapshotStore?: SnapshotStore,
    private eventBus?: EventBus,
    private snapshotFrequency: number = 10,
  ) {}

  async save(aggregate: T): Promise<void> {
    const events = aggregate.getUncommittedEvents();

    if (events.length === 0) {
      return;
    }

    await this.eventStore.append(events);

    // Publish events to event bus
    if (this.eventBus) {
      for (const event of events) {
        await this.eventBus.publish(event);
      }
    }

    aggregate.markEventsAsCommitted();

    // Create snapshot if needed
    if (
      this.snapshotStore &&
      aggregate.getVersion() % this.snapshotFrequency === 0
    ) {
      await this.snapshotStore.save(aggregate.createSnapshot());
    }

    debug.info(
      "EventSourcing",
      `Aggregate ${aggregate.getId()} saved with ${events.length} events`,
    );
  }

  async getById(
    id: string,
    aggregateFactory: (id: string) => T,
  ): Promise<T | null> {
    const aggregate = aggregateFactory(id);
    let fromVersion = 0;

    // Try to load from snapshot first
    if (this.snapshotStore) {
      const snapshot = await this.snapshotStore.get(id);
      if (snapshot) {
        aggregate.loadFromSnapshot(snapshot);
        fromVersion = snapshot.version;
        debug.debug(
          "EventSourcing",
          `Loaded aggregate ${id} from snapshot at version ${fromVersion}`,
        );
      }
    }

    // Load events since snapshot
    const events = await this.eventStore.getEvents(id, fromVersion + 1);
    if (events.length === 0 && fromVersion === 0) {
      return null; // Aggregate doesn't exist
    }

    aggregate.loadFromHistory(events);
    debug.debug(
      "EventSourcing",
      `Loaded aggregate ${id} with ${events.length} events since version ${fromVersion}`,
    );

    return aggregate;
  }
}

// Example aggregate implementation
export class UserAggregate extends AggregateRoot<{
  name: string;
  email: string;
  isActive: boolean;
}> {
  private name: string = "";
  private email: string = "";
  private isActive: boolean = false;

  getTypeName(): string {
    return "User";
  }

  // Commands
  register(name: string, email: string): void {
    if (this.version > 0) {
      throw new Error("User is already registered");
    }
    this.addEvent("UserRegistered", { name, email });
  }

  changeEmail(newEmail: string): void {
    if (!this.isActive) {
      throw new Error("Cannot change email for inactive user");
    }
    this.addEvent("EmailChanged", { oldEmail: this.email, newEmail });
  }

  deactivate(): void {
    if (!this.isActive) {
      throw new Error("User is already deactivated");
    }
    this.addEvent("UserDeactivated", {});
  }

  // Event handlers
  applyEvent(event: DomainEvent): void {
    switch (event.type) {
      case "UserRegistered":
        this.name = event.payload.name;
        this.email = event.payload.email;
        this.isActive = true;
        break;
      case "EmailChanged":
        this.email = event.payload.newEmail;
        break;
      case "UserDeactivated":
        this.isActive = false;
        break;
    }
  }

  protected getState(): { name: string; email: string; isActive: boolean } {
    return {
      name: this.name,
      email: this.email,
      isActive: this.isActive,
    };
  }

  protected loadState(state: {
    name: string;
    email: string;
    isActive: boolean;
  }): void {
    this.name = state.name;
    this.email = state.email;
    this.isActive = state.isActive;
  }

  // Getters
  getName(): string {
    return this.name;
  }
  getEmail(): string {
    return this.email;
  }
  getIsActive(): boolean {
    return this.isActive;
  }
}

// Event sourcing system
export class EventSourcingSystem {
  private eventStore: EventStore;
  private snapshotStore: SnapshotStore;
  private eventBus: EventBus;

  constructor() {
    this.eventStore = new InMemoryEventStore();
    this.snapshotStore = new InMemorySnapshotStore();
    this.eventBus = new EventBus();
  }

  getEventStore(): EventStore {
    return this.eventStore;
  }

  getSnapshotStore(): SnapshotStore {
    return this.snapshotStore;
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  createRepository<T extends AggregateRoot>(
    snapshotFrequency: number = 10,
  ): Repository<T> {
    return new Repository<T>(
      this.eventStore,
      this.snapshotStore,
      this.eventBus,
      snapshotFrequency,
    );
  }

  async replay(fromTimestamp: number = 0): Promise<void> {
    const events = await this.eventStore.getAllEvents(fromTimestamp);
    debug.info(
      "EventSourcing",
      `Replaying ${events.length} events from timestamp ${fromTimestamp}`,
    );

    for (const event of events) {
      await this.eventBus.publish(event);
    }
  }
}

// Global event sourcing system
export const eventSourcingSystem = new EventSourcingSystem();
