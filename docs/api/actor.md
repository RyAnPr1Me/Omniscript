# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [actor](#actor)

## actor

**File**: `src/runtime/actor.ts`

### Classes

#### Actor

**Implements**: `ActorRef`

**Properties**:

- `id: string` - 
- `state: TState` - 
- `behavior: ActorBehavior<TState>` - 
- `messageQueue: ActorMessage[]` - 
- `isProcessing: boolean` - 
- `isActive: boolean` - 
- `options: Required<ActorOptions>` - 
- `retryCount: number` - 
- `metrics: any` - 

**Methods**:

##### send

**Signature**: `async send(message: ActorMessage): Promise<void>`

##### ask

**Signature**: `async ask<T>(message: ActorMessage, timeout: number = 5000): Promise<T>`

##### processNextMessage

**Signature**: `private async processNextMessage(): Promise<void>`

##### handleError

**Signature**: `private async handleError(error: Error, message: ActorMessage): Promise<void>`

##### stop

**Signature**: `stop(): void`

##### getMetrics

**Signature**: `getMetrics()`

#### ActorSystem

**Properties**:

- `actors: Map<string, Actor>` - 
- `nextId: number` - 

**Methods**:

##### createActor

**Signature**: `createActor<TState>(
    behavior: ActorBehavior<TState>,
    initialState: TState,
    options: ActorOptions =`

##### getActor

**Signature**: `getActor(id: string): ActorRef | undefined`

##### broadcastMessage

**Signature**: `async broadcastMessage(message: ActorMessage): Promise<void>`

##### stopActor

**Signature**: `stopActor(id: string): void`

##### stopAll

**Signature**: `stopAll(): void`

##### getSystemMetrics

**Signature**: `getSystemMetrics()`

### Interfaces

#### ActorMessage

**Properties**:

- `id: string` - 
- `type: string` - 
- `payload: any` - 
- `sender: ActorRef` - 
- `timestamp: number` - 

#### ActorRef

**Properties**:

- `id: string` - 

**Methods**:

##### send

**Signature**: `send(message: ActorMessage): Promise<void>;`

##### ask

**Signature**: `ask<T>(message: ActorMessage, timeout?: number): Promise<T>;`

#### ActorBehavior

#### ActorOptions

**Properties**:

- `name: string` - 
- `supervisionStrategy: 'restart' | 'stop' | 'escalate'` - 
- `maxRetries: number` - 
- `messageQueueSize: number` - 
- `enableLogging: boolean` - 

### Functions

#### createCounterActor

**Signature**: `export function createCounterActor(initialValue: number = 0): ActorRef`

#### createAccumulatorActor

**Signature**: `export function createAccumulatorActor<T>(initialValue: T[] = []): ActorRef`


