# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [concurrency](#concurrency)

## concurrency

**File**: `src/concurrency/index.ts`

### Classes

#### CSPChannel

**Implements**: `Channel`

**Properties**:

- `buffer: T[]` - 
- `waitingSenders: Array<{ value: T; resolve: () => void }>` - 
- `waitingReceivers: Array<{ resolve: (value: T) => void }>` - 
- `closed: any` - 

**Methods**:

##### send

**Signature**: `async send(value: T): Promise<void>`

##### receive

**Signature**: `async receive(): Promise<T>`

##### close

**Signature**: `close(): void`

##### isClosed

**Signature**: `isClosed(): boolean`

#### ChannelSelect

**Methods**:

##### select

**Signature**: `static async select<T>(selectOp: Select<T>): Promise<T>`

#### AsyncScheduler

**Properties**:

- `taskQueue: Array<() => Promise<void>>` - 
- `running: any` - 
- `maxConcurrency: any` - 

**Methods**:

##### schedule

**Signature**: `async schedule<T>(task: () => Promise<T>): Promise<T>`

##### processTasks

**Signature**: `private async processTasks(): Promise<void>`

##### parallel

**Signature**: `async parallel<T>(tasks: Array<() => Promise<T>>): Promise<T[]>`

##### race

**Signature**: `async race<T>(tasks: Array<() => Promise<T>>): Promise<T>`

#### WorkerPool

**Properties**:

- `workers: CustomWorker[]` - 
- `availableWorkers: CustomWorker[]` - 
- `taskQueue: Array<{ task: any; resolve: (value: any) => void; reject: (error: any) => void }>` - 

**Methods**:

##### initializeWorkers

**Signature**: `private initializeWorkers(): void`

##### execute

**Signature**: `async execute<T>(task: () => T): Promise<T>`

##### processTasks

**Signature**: `private async processTasks(): Promise<void>`

##### terminate

**Signature**: `terminate(): void`

#### AtomicOperations

**Properties**:

- `locks: Map<string, boolean>` - 
- `waitQueues: Map<string, Array<() => void>>` - 

**Methods**:

##### lock

**Signature**: `async lock(key: string): Promise<void>`

##### unlock

**Signature**: `unlock(key: string): void`

##### withLock

**Signature**: `async withLock<T>(key: string, operation: () => Promise<T>): Promise<T>`

##### compareAndSwap

**Signature**: `compareAndSwap<T>(target:`

#### Future

**Properties**:

- `promise: Promise<T>` - 
- `resolveCallback: (value: T) => void` - 
- `rejectCallback: (error: any) => void` - 
- `completed: any` - 
- `value: T` - 
- `error: any` - 

**Methods**:

##### complete

**Signature**: `complete(value: T): void`

##### completeExceptionally

**Signature**: `completeExceptionally(error: any): void`

##### isCompleted

**Signature**: `isCompleted(): boolean`

##### get

**Signature**: `async get(): Promise<T>`

##### timeout

**Signature**: `async timeout(ms: number): Promise<T>`

##### map

**Signature**: `map<U>(fn: (value: T) => U): Future<U>`

##### flatMap

**Signature**: `flatMap<U>(fn: (value: T) => Future<U>): Future<U>`

#### ReactiveStream

**Properties**:

- `subscribers: Array<(value: T) => void>` - 
- `errorHandlers: Array<(error: any) => void>` - 
- `completeHandlers: Array<() => void>` - 
- `completed: any` - 

**Methods**:

##### emit

**Signature**: `emit(value: T): void`

##### emitError

**Signature**: `emitError(error: any): void`

##### complete

**Signature**: `complete(): void`

##### subscribe

**Signature**: `subscribe(handler: (value: T) => void): () => void`

##### onError

**Signature**: `onError(handler: (error: any) => void): () => void`

##### onComplete

**Signature**: `onComplete(handler: () => void): () => void`

##### map

**Signature**: `map<U>(fn: (value: T) => U): ReactiveStream<U>`

##### filter

**Signature**: `filter(predicate: (value: T) => boolean): ReactiveStream<T>`

##### take

**Signature**: `take(count: number): ReactiveStream<T>`

### Interfaces

#### Channel

**Methods**:

##### send

**Signature**: `send(value: T): Promise<void>;`

##### receive

**Signature**: `receive(): Promise<T>;`

##### close

**Signature**: `close(): void;`

##### isClosed

**Signature**: `isClosed(): boolean;`

#### Select

**Properties**:

- `cases: SelectCase<T>[]` - 
- `default: () => T` - 
- `timeout: number` - 

#### SelectCase

**Properties**:

- `channel: Channel<any>` - 
- `operation: 'send' | 'receive'` - 
- `value: any` - 
- `handler: (value?: any) => T` - 

#### CustomWorker

**Properties**:

- `id: number` - 
- `busy: boolean` - 
- `execute: (task: any) => Promise<any>` - 
- `terminate: () => void` - 


