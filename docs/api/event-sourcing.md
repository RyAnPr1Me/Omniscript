# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [event-sourcing](#event-sourcing)

## event-sourcing

**File**: `src/runtime/event-sourcing.ts`

### Classes

#### InMemoryEventStore

**Implements**: `EventStore`

**Properties**:

- `events: DomainEvent[]` - 
- `eventsByAggregate: Map<string, DomainEvent[]>` - 
- `eventsByType: Map<string, DomainEvent[]>` - 

**Methods**:

##### append

**Signature**: `async append(events: DomainEvent[]): Promise<void>`

##### getEvents

**Signature**: `async getEvents(aggregateId: string, fromVersion: number = 0): Promise<DomainEvent[]>`

##### getAllEvents

**Signature**: `async getAllEvents(fromTimestamp: number = 0): Promise<DomainEvent[]>`

##### getEventsByType

**Signature**: `async getEventsByType(eventType: string): Promise<DomainEvent[]>`

#### InMemorySnapshotStore

**Implements**: `SnapshotStore`

**Properties**:

- `snapshots: Map<string, Snapshot<any>>` - 

**Methods**:

##### save

**Signature**: `async save<T>(snapshot: Snapshot<T>): Promise<void>`

##### get

**Signature**: `async get<T>(aggregateId: string): Promise<Snapshot<T> | null>`

#### AggregateRoot

**Properties**:

- `id: string` - 
- `version: number` - 
- `uncommittedEvents: DomainEvent[]` - 

**Methods**:

##### getTypeName

**Signature**: `abstract getTypeName(): string;`

##### applyEvent

**Signature**: `abstract applyEvent(event: DomainEvent): void;`

##### getId

**Signature**: `getId(): string`

##### getVersion

**Signature**: `getVersion(): number`

##### addEvent

**Signature**: `protected addEvent(eventType: string, payload: any, metadata: Record<string, any> =`

##### getUncommittedEvents

**Signature**: `getUncommittedEvents(): DomainEvent[]`

##### markEventsAsCommitted

**Signature**: `markEventsAsCommitted(): void`

##### loadFromHistory

**Signature**: `loadFromHistory(events: DomainEvent[]): void`

##### createSnapshot

**Signature**: `createSnapshot(): Snapshot<T>`

##### loadFromSnapshot

**Signature**: `loadFromSnapshot(snapshot: Snapshot<T>): void`

##### getState

**Signature**: `protected abstract getState(): T;`

##### loadState

**Signature**: `protected abstract loadState(state: T): void;`

##### generateEventId

**Signature**: `private generateEventId(): string`

#### EventBus

**Properties**:

- `handlers: Map<string, EventHandler[]>` - 
- `projections: Map<string, (event: DomainEvent) => Promise<void>>` - 

**Methods**:

##### subscribe

**Signature**: `subscribe(eventType: string, handler: EventHandler): void`

##### addProjection

**Signature**: `addProjection(name: string, projectionHandler: (event: DomainEvent) => Promise<void>): void`

##### publish

**Signature**: `async publish(event: DomainEvent): Promise<void>`

#### Repository

**Methods**:

##### save

**Signature**: `async save(aggregate: T): Promise<void>`

##### getById

**Signature**: `async getById(id: string, aggregateFactory: (id: string) => T): Promise<T | null>`

#### UserAggregate

**Extends**: `AggregateRoot`

**Properties**:

- `name: string` - 
- `email: string` - 
- `isActive: boolean` - 

**Methods**:

##### getTypeName

**Signature**: `getTypeName(): string`

##### register

**Signature**: `register(name: string, email: string): void`

##### changeEmail

**Signature**: `changeEmail(newEmail: string): void`

##### deactivate

**Signature**: `deactivate(): void`

##### applyEvent

**Signature**: `applyEvent(event: DomainEvent): void`

##### getState

**Signature**: `protected getState():`

##### loadState

**Signature**: `protected loadState(state:`

##### getName

**Signature**: `getName(): string`

##### getEmail

**Signature**: `getEmail(): string`

##### getIsActive

**Signature**: `getIsActive(): boolean`

#### EventSourcingSystem

**Properties**:

- `eventStore: EventStore` - 
- `snapshotStore: SnapshotStore` - 
- `eventBus: EventBus` - 

**Methods**:

##### getEventStore

**Signature**: `getEventStore(): EventStore`

##### getSnapshotStore

**Signature**: `getSnapshotStore(): SnapshotStore`

##### getEventBus

**Signature**: `getEventBus(): EventBus`

##### createRepository

**Signature**: `createRepository<T extends AggregateRoot>(snapshotFrequency: number = 10): Repository<T>`

##### replay

**Signature**: `async replay(fromTimestamp: number = 0): Promise<void>`

### Interfaces

#### DomainEvent

**Properties**:

- `id: string` - 
- `type: string` - 
- `aggregateId: string` - 
- `aggregateType: string` - 
- `payload: any` - 
- `metadata: Record<string, any>` - 
- `timestamp: number` - 
- `version: number` - 
- `causationId: string` - 
- `correlationId: string` - 

#### EventStore

**Methods**:

##### append

**Signature**: `append(events: DomainEvent[]): Promise<void>;`

##### getEvents

**Signature**: `getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;`

##### getAllEvents

**Signature**: `getAllEvents(fromTimestamp?: number): Promise<DomainEvent[]>;`

##### getEventsByType

**Signature**: `getEventsByType(eventType: string): Promise<DomainEvent[]>;`

#### Snapshot

**Properties**:

- `aggregateId: string` - 
- `aggregateType: string` - 
- `data: T` - 
- `version: number` - 
- `timestamp: number` - 

#### SnapshotStore

**Methods**:

##### save

**Signature**: `save<T>(snapshot: Snapshot<T>): Promise<void>;`

##### get

**Signature**: `get<T>(aggregateId: string): Promise<Snapshot<T> | null>;`

#### EventHandler

**Properties**:

- `eventType: string` - 

**Methods**:

##### handle

**Signature**: `handle(event: DomainEvent): Promise<T>;`


