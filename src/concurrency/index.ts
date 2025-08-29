import { OmniscriptError } from '../errors';

// Advanced concurrency primitives for Omniscript
export interface Channel<T> {
  send(value: T): Promise<void>;
  receive(): Promise<T>;
  close(): void;
  isClosed(): boolean;
}

export interface Select<T> {
  cases: SelectCase<T>[];
  default?: () => T;
  timeout?: number;
}

export interface SelectCase<T> {
  channel: Channel<any>;
  operation: 'send' | 'receive';
  value?: any;
  handler: (value?: any) => T;
}

// CSP-style channels
class CSPChannel<T> implements Channel<T> {
  private buffer: T[] = [];
  private waitingSenders: Array<{ value: T; resolve: () => void }> = [];
  private waitingReceivers: Array<{ resolve: (value: T) => void }> = [];
  private closed = false;
  
  constructor(private bufferSize: number = 0) {}

  async send(value: T): Promise<void> {
    if (this.closed) {
      throw new OmniscriptError('Cannot send to closed channel');
    }

    // If there's a waiting receiver, send directly
    if (this.waitingReceivers.length > 0) {
      const receiver = this.waitingReceivers.shift()!;
      receiver.resolve(value);
      return;
    }

    // If buffer has space, add to buffer
    if (this.buffer.length < this.bufferSize) {
      this.buffer.push(value);
      return;
    }

    // Otherwise, wait for receiver
    return new Promise<void>((resolve) => {
      this.waitingSenders.push({ value, resolve });
    });
  }

  async receive(): Promise<T> {
    if (this.closed && this.buffer.length === 0 && this.waitingSenders.length === 0) {
      throw new OmniscriptError('Cannot receive from closed channel');
    }

    // If buffer has values, return immediately
    if (this.buffer.length > 0) {
      const value = this.buffer.shift()!;
      
      // If there are waiting senders, move one to buffer
      if (this.waitingSenders.length > 0) {
        const sender = this.waitingSenders.shift()!;
        this.buffer.push(sender.value);
        sender.resolve();
      }
      
      return value;
    }

    // If there's a waiting sender, receive directly
    if (this.waitingSenders.length > 0) {
      const sender = this.waitingSenders.shift()!;
      sender.resolve();
      return sender.value;
    }

    // Otherwise, wait for sender
    return new Promise<T>((resolve) => {
      this.waitingReceivers.push({ resolve });
    });
  }

  close(): void {
    this.closed = true;
    
    // Reject all waiting receivers
    this.waitingReceivers.forEach(receiver => {
      receiver.resolve(null as any); // Could use special closed value
    });
    this.waitingReceivers = [];
  }

  isClosed(): boolean {
    return this.closed;
  }
}

// Select statement for channel operations
class ChannelSelect {
  static async select<T>(selectOp: Select<T>): Promise<T> {
    const promises: Promise<{ index: number; value: any }>[] = [];

    // Create promises for each case
    selectOp.cases.forEach((selectCase, index) => {
      if (selectCase.operation === 'receive') {
        promises.push(
          selectCase.channel.receive().then(value => ({ index, value }))
        );
      } else if (selectCase.operation === 'send') {
        promises.push(
          selectCase.channel.send(selectCase.value).then(() => ({ index, value: undefined }))
        );
      }
    });

    // Add timeout if specified
    if (selectOp.timeout !== undefined) {
      promises.push(
        new Promise<{ index: number; value: any }>((_, reject) => {
          setTimeout(() => reject(new Error('Select timeout')), selectOp.timeout);
        })
      );
    }

    try {
      const result = await Promise.race(promises);
      const selectedCase = selectOp.cases[result.index];
      return selectedCase.handler(result.value);
    } catch (error) {
      if (selectOp.default) {
        return selectOp.default();
      }
      throw error;
    }
  }
}

// Async/await enhancements
class AsyncScheduler {
  private taskQueue: Array<() => Promise<void>> = [];
  private running = false;
  private maxConcurrency = 10;

  constructor(maxConcurrency = 10) {
    this.maxConcurrency = maxConcurrency;
  }

  async schedule<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processTasks();
    });
  }

  private async processTasks(): Promise<void> {
    if (this.running) return;
    this.running = true;

    const runningTasks: Set<Promise<void>> = new Set();

    while (this.taskQueue.length > 0 || runningTasks.size > 0) {
      // Start new tasks up to concurrency limit
      while (this.taskQueue.length > 0 && runningTasks.size < this.maxConcurrency) {
        const task = this.taskQueue.shift()!;
        const taskPromise = task().catch(() => {}); // Prevent unhandled rejection
        runningTasks.add(taskPromise);
        
        taskPromise.finally(() => {
          runningTasks.delete(taskPromise);
        });
      }

      // Wait for at least one task to complete
      if (runningTasks.size > 0) {
        await Promise.race(runningTasks);
      }
    }

    this.running = false;
  }

  async parallel<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
    const promises = tasks.map(task => this.schedule(task));
    return Promise.all(promises);
  }

  async race<T>(tasks: Array<() => Promise<T>>): Promise<T> {
    const promises = tasks.map(task => this.schedule(task));
    return Promise.race(promises);
  }
}

// Worker thread abstraction
interface CustomWorker {
  id: number;
  busy: boolean;
  execute: (task: any) => Promise<any>;
  terminate?: () => void;
}

class WorkerPool {
  private workers: CustomWorker[] = [];
  private availableWorkers: CustomWorker[] = [];
  private taskQueue: Array<{ task: any; resolve: (value: any) => void; reject: (error: any) => void }> = [];

  constructor(private workerCount: number = 4) {
    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.workerCount; i++) {
      // In a real implementation, would create actual worker threads
      const worker: CustomWorker = {
        id: i,
        busy: false,
        execute: (task: any) => Promise.resolve(task()) // Simplified execution
      };
      
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  async execute<T>(task: () => T): Promise<T> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task, resolve, reject });
      this.processTasks();
    });
  }

  private async processTasks(): Promise<void> {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const { task, resolve, reject } = this.taskQueue.shift()!;
      const worker = this.availableWorkers.shift()!;
      
      worker.busy = true;
      
      try {
        const result = await worker.execute(task);
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        worker.busy = false;
        this.availableWorkers.push(worker);
        this.processTasks(); // Process next task
      }
    }
  }

  terminate(): void {
    // In real implementation, would terminate worker threads
    this.workers.forEach(worker => {
      if (worker.terminate) {
        worker.terminate();
      }
    });
    this.workers = [];
    this.availableWorkers = [];
  }
}

// Atomic operations
class AtomicOperations {
  private locks: Map<string, boolean> = new Map();
  private waitQueues: Map<string, Array<() => void>> = new Map();

  async lock(key: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.locks.get(key)) {
        this.locks.set(key, true);
        resolve();
      } else {
        if (!this.waitQueues.has(key)) {
          this.waitQueues.set(key, []);
        }
        this.waitQueues.get(key)!.push(resolve);
      }
    });
  }

  unlock(key: string): void {
    this.locks.set(key, false);
    
    const waitQueue = this.waitQueues.get(key);
    if (waitQueue && waitQueue.length > 0) {
      const next = waitQueue.shift()!;
      this.locks.set(key, true);
      next();
    }
  }

  async withLock<T>(key: string, operation: () => Promise<T>): Promise<T> {
    await this.lock(key);
    try {
      return await operation();
    } finally {
      this.unlock(key);
    }
  }

  compareAndSwap<T>(target: { value: T }, expected: T, newValue: T): boolean {
    if (target.value === expected) {
      target.value = newValue;
      return true;
    }
    return false;
  }
}

// Future/Promise enhancements
class Future<T> {
  private promise: Promise<T>;
  private resolveCallback!: (value: T) => void;
  private rejectCallback!: (error: any) => void;
  private completed = false;
  private value?: T;
  private error?: any;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolveCallback = resolve;
      this.rejectCallback = reject;
    });
  }

  complete(value: T): void {
    if (this.completed) return;
    this.completed = true;
    this.value = value;
    this.resolveCallback(value);
  }

  completeExceptionally(error: any): void {
    if (this.completed) return;
    this.completed = true;
    this.error = error;
    this.rejectCallback(error);
  }

  isCompleted(): boolean {
    return this.completed;
  }

  async get(): Promise<T> {
    return this.promise;
  }

  async timeout(ms: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Future timeout')), ms);
    });
    
    return Promise.race([this.promise, timeoutPromise]);
  }

  map<U>(fn: (value: T) => U): Future<U> {
    const mapped = new Future<U>();
    this.promise.then(
      value => mapped.complete(fn(value)),
      error => mapped.completeExceptionally(error)
    );
    return mapped;
  }

  flatMap<U>(fn: (value: T) => Future<U>): Future<U> {
    const flatMapped = new Future<U>();
    this.promise.then(
      value => {
        const inner = fn(value);
        inner.get().then(
          innerValue => flatMapped.complete(innerValue),
          error => flatMapped.completeExceptionally(error)
        );
      },
      error => flatMapped.completeExceptionally(error)
    );
    return flatMapped;
  }
}

// Reactive streams
class ReactiveStream<T> {
  private subscribers: Array<(value: T) => void> = [];
  private errorHandlers: Array<(error: any) => void> = [];
  private completeHandlers: Array<() => void> = [];
  private completed = false;

  emit(value: T): void {
    if (this.completed) return;
    this.subscribers.forEach(handler => {
      try {
        handler(value);
      } catch (error) {
        this.emitError(error);
      }
    });
  }

  emitError(error: any): void {
    this.errorHandlers.forEach(handler => handler(error));
  }

  complete(): void {
    if (this.completed) return;
    this.completed = true;
    this.completeHandlers.forEach(handler => handler());
  }

  subscribe(handler: (value: T) => void): () => void {
    this.subscribers.push(handler);
    return () => {
      const index = this.subscribers.indexOf(handler);
      if (index >= 0) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  onError(handler: (error: any) => void): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index >= 0) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  onComplete(handler: () => void): () => void {
    this.completeHandlers.push(handler);
    return () => {
      const index = this.completeHandlers.indexOf(handler);
      if (index >= 0) {
        this.completeHandlers.splice(index, 1);
      }
    };
  }

  map<U>(fn: (value: T) => U): ReactiveStream<U> {
    const mapped = new ReactiveStream<U>();
    this.subscribe(value => mapped.emit(fn(value)));
    this.onError(error => mapped.emitError(error));
    this.onComplete(() => mapped.complete());
    return mapped;
  }

  filter(predicate: (value: T) => boolean): ReactiveStream<T> {
    const filtered = new ReactiveStream<T>();
    this.subscribe(value => {
      if (predicate(value)) {
        filtered.emit(value);
      }
    });
    this.onError(error => filtered.emitError(error));
    this.onComplete(() => filtered.complete());
    return filtered;
  }

  take(count: number): ReactiveStream<T> {
    const taken = new ReactiveStream<T>();
    let emitted = 0;
    
    this.subscribe(value => {
      if (emitted < count) {
        taken.emit(value);
        emitted++;
        if (emitted === count) {
          taken.complete();
        }
      }
    });
    
    this.onError(error => taken.emitError(error));
    return taken;
  }
}

export {
  CSPChannel,
  ChannelSelect,
  AsyncScheduler,
  WorkerPool,
  AtomicOperations,
  Future,
  ReactiveStream
};