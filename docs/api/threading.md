# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [threading](#threading)

## threading

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/threading.ts`

### Classes

#### WorkerThread

**Properties**:

- `worker: globalThis.Worker | null` - 
- `currentTask: Task | null` - 
- `isIdle: boolean` - 
- `lastUsed: number` - 
- `metrics: WorkerMetrics` - 

**Methods**:

##### initialize

**Signature**: `private initialize(): void`

##### execute

**Signature**: `async execute<T, R>(task: Task<T, R>): Promise<R>`

##### simulateTaskExecution

**Signature**: `private simulateTaskExecution(data: any): any`

##### handleMessage

**Signature**: `private handleMessage(event: MessageEvent): void`

##### handleError

**Signature**: `private handleError(error: ErrorEvent): void`

##### isAvailable

**Signature**: `isAvailable(): boolean`

##### getIdleTime

**Signature**: `getIdleTime(): number`

##### terminate

**Signature**: `terminate(): void`

#### ThreadPool

**Properties**:

- `workers: WorkerThread[]` - 
- `taskQueue: Task[]` - 
- `options: Required<ThreadPoolOptions>` - 
- `isRunning: boolean` - 

**Methods**:

##### initializeWorkers

**Signature**: `private initializeWorkers(): void`

##### submit

**Signature**: `async submit<T, R>(data: T): Promise<R>`

##### parallel

**Signature**: `async parallel<T, R>(items: T[], operation: (item: T) => R | Promise<R>): Promise<R[]>`

##### map

**Signature**: `async map<T, R>(items: T[], mapper: (item: T, index: number) => R | Promise<R>): Promise<R[]>`

##### reduce

**Signature**: `async reduce<T, R>(items: T[], reducer: (acc: R, item: T, index: number) => R, initialValue: R): Promise<R>`

##### chunkArray

**Signature**: `private chunkArray<T>(array: T[], chunkCount: number): T[][]`

##### getAvailableWorker

**Signature**: `private getAvailableWorker(): WorkerThread | null`

##### generateTaskId

**Signature**: `private generateTaskId(): string`

##### startMaintenanceLoop

**Signature**: `private startMaintenanceLoop(): void`

##### getStats

**Signature**: `getStats()`

##### shutdown

**Signature**: `async shutdown(): Promise<void>`

#### Worker

**Properties**:

- `worker: globalThis.Worker` - 

**Methods**:

##### postMessage

**Signature**: `postMessage(data: any): void`

##### onMessage

**Signature**: `onMessage(callback: (data: any) => void): void`

##### terminate

**Signature**: `terminate(): void`

### Interfaces

#### ThreadPoolOptions

**Properties**:

- `minThreads: number` - 
- `maxThreads: number` - 
- `idleTimeout: number` - 
- `taskTimeout: number` - 
- `enableLoadBalancing: boolean` - 
- `priority: 'low' | 'normal' | 'high'` - 
- `retryAttempts: number` - 
- `enableMetrics: boolean` - 

#### Task

**Properties**:

- `id: string` - 
- `data: T` - 
- `resolve: (value: R) => void` - 
- `reject: (error: Error) => void` - 
- `createdAt: number` - 
- `priority: number` - 
- `retryCount: number` - 
- `maxRetries: number` - 
- `dependencies: string[]` - 

#### WorkerMetrics

**Properties**:

- `tasksCompleted: number` - 
- `tasksInProgress: number` - 
- `averageExecutionTime: number` - 
- `errorCount: number` - 
- `cpuUsage: number` - 
- `memoryUsage: number` - 

#### ThreadPoolMetrics

**Properties**:

- `activeThreads: number` - 
- `idleThreads: number` - 
- `totalTasks: number` - 
- `completedTasks: number` - 
- `failedTasks: number` - 
- `queueLength: number` - 
- `averageWaitTime: number` - 
- `throughput: number` - 

### Functions

#### parallel

**Signature**: `export async function parallel<T, R>(items: T[], operation: (item: T) => R | Promise<R>): Promise<R[]>`

#### parallelMap

**Signature**: `export async function parallelMap<T, R>(items: T[], mapper: (item: T, index: number) => R | Promise<R>): Promise<R[]>`

#### parallelReduce

**Signature**: `export async function parallelReduce<T, R>(items: T[], reducer: (acc: R, item: T, index: number) => R, initialValue: R): Promise<R>`


