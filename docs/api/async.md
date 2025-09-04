# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [async](#async)

## async

**File**: `src/stdlib/async.ts`

### Classes

#### AsyncUtils

**Methods**:

##### sleep

Sleep for specified milliseconds

**Signature**: `static sleep(ms: number): Promise<void>`

##### timeout

Add timeout to a promise

**Signature**: `static timeout<T>(promise: Promise<T>, ms: number, options?: TimeoutOptions): Promise<T>`

##### retry

Retry a function with configurable options

**Signature**: `static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions
  ): Promise<T>`

##### parallel

Execute promises with limited concurrency

**Signature**: `static async parallel<T>(
    tasks: (() => Promise<T>)[],
    maxConcurrency: number = 5
  ): Promise<T[]>`

##### sequence

Execute promises in sequence (one after another)

**Signature**: `static async sequence<T>(tasks: (() => Promise<T>)[]): Promise<T[]>`

##### debounce

Debounce a function call

**Signature**: `static debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ): T`

##### throttle

Throttle a function call

**Signature**: `static throttle<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ): T`

##### createRateLimiter

Create a simple rate limiter

**Signature**: `static createRateLimiter(options: RateLimiterOptions)`

##### poll

Poll a function until it returns a truthy value or times out

**Signature**: `static async poll<T>(
    fn: () => Promise<T> | T,
    options:`

##### first

Create a promise that resolves to the first resolved value

**Signature**: `static async first<T>(promises: Promise<T>[]): Promise<T>`

##### allSettled

Create a promise that resolves when all promises settle (succeed or fail)

**Signature**: `static async allSettled<T>(promises: Promise<T>[]): Promise<Array<`

##### promisify

Wrap a callback-based function to return a promise

**Signature**: `static promisify<T extends (...args: any[]) => void>(
    fn: T
  ): (...args: any[]) => Promise<any>`

##### cancellable

Create a cancellable promise

**Signature**: `static cancellable<T>(
    executor: (resolve: (value: T) => void, reject: (reason: any) => void, signal: AbortSignal) => void
  ):`

##### memoizeAsync

Memoize async function results

**Signature**: `static memoizeAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyFn?: (...args: Parameters<T>) => string
  ): T`

##### delay

Create a promise that resolves after a delay

**Signature**: `static delay<T>(ms: number, value?: T): Promise<T | undefined>`

##### measure

Execute a function and measure its execution time

**Signature**: `static async measure<T>(fn: () => Promise<T>): Promise<`

#### AsyncPatterns

Advanced async patterns and utilities - Extended

**Methods**:

##### cancellable

Create a cancellable async operation

**Signature**: `static cancellable<T>(operation: (signal: AbortSignal) => Promise<T>):`

##### pipeline

Create an async pipeline with transformation steps

**Signature**: `static pipeline<T, U>(
    input: T,
    ...steps: Array<(value: any) => Promise<any> | any>
  ): Promise<U>`

##### reduce

Async reduce with concurrency control

**Signature**: `static async reduce<T, U>(
    items: T[],
    reducer: (acc: U, item: T, index: number) => Promise<U>,
    initialValue: U,
    concurrency: number = 1
  ): Promise<U>`

##### createQueue

Create an async queue with processing function

**Signature**: `static createQueue<T, U>(
    processor: (item: T) => Promise<U>,
    options:`

##### createSemaphore

Create a semaphore for resource limiting

**Signature**: `static createSemaphore(permits: number):`

##### createCircuitBreaker

Create a circuit breaker for fault tolerance

**Signature**: `static createCircuitBreaker<T extends any[], U>(
    fn: (...args: T) => Promise<U>,
    options:`

##### raceN

Race multiple async operations, return first N results

**Signature**: `static async raceN<T>(
    promises: Promise<T>[],
    count: number
  ): Promise<T[]>`

### Interfaces

#### RetryOptions

**Properties**:

- `maxRetries: number` - 
- `delay: number` - 
- `backoff: 'linear' | 'exponential'` - 
- `backoffFactor: number` - 
- `shouldRetry: (error: any, attempt: number) => boolean` - 

#### TimeoutOptions

**Properties**:

- `signal: AbortSignal` - 

#### RateLimiterOptions

**Properties**:

- `maxConcurrent: number` - 
- `interval: number` - 
- `maxPerInterval: number` - 


