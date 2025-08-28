import { debug } from '../debug';

export interface ThreadPoolOptions {
  minThreads?: number;
  maxThreads?: number;
  idleTimeout?: number;
  taskTimeout?: number;
}

export interface Task<T = any, R = any> {
  id: string;
  data: T;
  resolve: (value: R) => void;
  reject: (error: Error) => void;
  createdAt: number;
}

export class WorkerThread {
  private worker: globalThis.Worker | null = null;
  private currentTask: Task | null = null;
  private isIdle: boolean = true;
  private lastUsed: number = Date.now();

  constructor(private scriptURL: string) {
    this.initialize();
  }

  private initialize(): void {
    try {
      // In Node.js environment, we'll simulate worker behavior
      if (typeof globalThis.Worker !== 'undefined') {
        this.worker = new globalThis.Worker(this.scriptURL);
        this.worker.onmessage = this.handleMessage.bind(this);
        this.worker.onerror = this.handleError.bind(this);
      }
    } catch (error) {
      debug.warn('Threading', 'Worker not available, using synchronous execution');
    }
  }

  async execute<T, R>(task: Task<T, R>): Promise<R> {
    this.isIdle = false;
    this.currentTask = task;
    this.lastUsed = Date.now();

    if (this.worker) {
      return new Promise<R>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Task timeout'));
        }, 30000); // 30 second timeout

        this.currentTask!.resolve = (value: R) => {
          clearTimeout(timeout);
          resolve(value);
          this.isIdle = true;
          this.currentTask = null;
        };

        this.currentTask!.reject = (error: Error) => {
          clearTimeout(timeout);
          reject(error);
          this.isIdle = true;
          this.currentTask = null;
        };

        this.worker!.postMessage(task.data);
      });
    } else {
      // Simulate async execution for non-worker environments
      return new Promise<R>((resolve, reject) => {
        setImmediate(() => {
          try {
            // Simulate task processing
            const result = this.simulateTaskExecution(task.data);
            resolve(result as R);
            this.isIdle = true;
            this.currentTask = null;
          } catch (error) {
            reject(error as Error);
            this.isIdle = true;
            this.currentTask = null;
          }
        });
      });
    }
  }

  private simulateTaskExecution(data: any): any {
    // Simple simulation for testing purposes
    if (typeof data === 'function') {
      return data();
    }
    if (data && typeof data.operation === 'string') {
      switch (data.operation) {
        case 'multiply':
          return data.a * data.b;
        case 'add':
          return data.a + data.b;
        case 'process':
          return { processed: true, data: data.input };
        default:
          return data;
      }
    }
    return data;
  }

  private handleMessage(event: MessageEvent): void {
    if (this.currentTask) {
      this.currentTask.resolve(event.data);
    }
  }

  private handleError(error: ErrorEvent): void {
    if (this.currentTask) {
      this.currentTask.reject(new Error(error.message));
    }
  }

  isAvailable(): boolean {
    return this.isIdle;
  }

  getIdleTime(): number {
    return Date.now() - this.lastUsed;
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export class ThreadPool {
  private workers: WorkerThread[] = [];
  private taskQueue: Task[] = [];
  private options: Required<ThreadPoolOptions>;
  private isRunning: boolean = true;

  constructor(options: ThreadPoolOptions = {}) {
    this.options = {
      minThreads: options.minThreads || 2,
      maxThreads: options.maxThreads || 8,
      idleTimeout: options.idleTimeout || 60000, // 1 minute
      taskTimeout: options.taskTimeout || 30000  // 30 seconds
    };

    this.initializeWorkers();
    this.startMaintenanceLoop();
    
    debug.info('ThreadPool', `Thread pool initialized with ${this.options.minThreads}-${this.options.maxThreads} threads`);
  }

  private initializeWorkers(): void {
    // Create minimum number of workers
    for (let i = 0; i < this.options.minThreads; i++) {
      this.workers.push(new WorkerThread(''));
    }
  }

  async submit<T, R>(data: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const task: Task<T, R> = {
        id: this.generateTaskId(),
        data,
        resolve,
        reject,
        createdAt: Date.now()
      };

      const availableWorker = this.getAvailableWorker();
      
      if (availableWorker) {
        availableWorker.execute(task).then(resolve).catch(reject);
      } else if (this.workers.length < this.options.maxThreads) {
        // Create new worker if under max limit
        const newWorker = new WorkerThread('');
        this.workers.push(newWorker);
        newWorker.execute(task).then(resolve).catch(reject);
        debug.debug('ThreadPool', `Created new worker, total: ${this.workers.length}`);
      } else {
        // Queue the task if all workers are busy
        this.taskQueue.push(task);
        debug.debug('ThreadPool', `Task queued, queue size: ${this.taskQueue.length}`);
      }
    });
  }

  async parallel<T, R>(items: T[], operation: (item: T) => R | Promise<R>): Promise<R[]> {
    const tasks = items.map(item => {
      return this.submit({
        operation: 'custom',
        item,
        fn: operation.toString()
      }) as Promise<R>;
    });

    return Promise.all(tasks);
  }

  async map<T, R>(items: T[], mapper: (item: T, index: number) => R | Promise<R>): Promise<R[]> {
    const chunks = this.chunkArray(items, this.workers.length);
    const chunkTasks = chunks.map((chunk, chunkIndex) => {
      return this.submit({
        operation: 'map',
        chunk,
        mapper: mapper.toString(),
        startIndex: chunkIndex * Math.ceil(items.length / chunks.length)
      }) as Promise<R[]>;
    });

    const results = await Promise.all(chunkTasks);
    return results.flat();
  }

  async reduce<T, R>(items: T[], reducer: (acc: R, item: T, index: number) => R, initialValue: R): Promise<R> {
    const chunks = this.chunkArray(items, this.workers.length);
    
    // Parallel reduce each chunk
    const chunkTasks = chunks.map((chunk, chunkIndex) => {
      return this.submit({
        operation: 'reduce',
        chunk,
        reducer: reducer.toString(),
        initialValue: chunkIndex === 0 ? initialValue : undefined,
        startIndex: chunkIndex * Math.ceil(items.length / chunks.length)
      }) as Promise<R>;
    });

    const chunkResults = await Promise.all(chunkTasks);
    
    // Combine chunk results
    return chunkResults.reduce((acc, current) => reducer(acc, current as any as T, 0), initialValue);
  }

  private chunkArray<T>(array: T[], chunkCount: number): T[][] {
    const chunks: T[][] = [];
    const chunkSize = Math.ceil(array.length / chunkCount);
    
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  private getAvailableWorker(): WorkerThread | null {
    return this.workers.find(worker => worker.isAvailable()) || null;
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private startMaintenanceLoop(): void {
    const maintenance = () => {
      if (!this.isRunning) return;

      // Process queued tasks
      while (this.taskQueue.length > 0) {
        const availableWorker = this.getAvailableWorker();
        if (availableWorker) {
          const task = this.taskQueue.shift()!;
          availableWorker.execute(task).then(task.resolve).catch(task.reject);
        } else {
          break;
        }
      }

      // Clean up idle workers (keep minimum number)
      if (this.workers.length > this.options.minThreads) {
        this.workers = this.workers.filter(worker => {
          if (worker.isAvailable() && worker.getIdleTime() > this.options.idleTimeout) {
            worker.terminate();
            debug.debug('ThreadPool', `Terminated idle worker, remaining: ${this.workers.length - 1}`);
            return false;
          }
          return true;
        });
      }

      setTimeout(maintenance, 5000); // Run every 5 seconds
    };

    setTimeout(maintenance, 5000);
  }

  getStats() {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.workers.filter(w => w.isAvailable()).length,
      busyWorkers: this.workers.filter(w => !w.isAvailable()).length,
      queuedTasks: this.taskQueue.length,
      options: this.options
    };
  }

  async shutdown(): Promise<void> {
    this.isRunning = false;
    
    // Wait for current tasks to complete (with timeout)
    const shutdownTimeout = 10000; // 10 seconds
    const startTime = Date.now();
    
    while (this.workers.some(w => !w.isAvailable()) && (Date.now() - startTime) < shutdownTimeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Terminate all workers
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.taskQueue = [];
    
    debug.info('ThreadPool', 'Thread pool shut down');
  }
}

// Legacy Worker class for backward compatibility
export class Worker {
  private worker: globalThis.Worker;

  constructor(scriptURL: string) {
    this.worker = new globalThis.Worker(scriptURL);
  }

  postMessage(data: any): void {
    this.worker.postMessage(data);
  }

  onMessage(callback: (data: any) => void): void {
    this.worker.onmessage = (event) => callback(event.data);
  }

  terminate(): void {
    this.worker.terminate();
  }
}

// Utility functions
export async function parallel<T, R>(items: T[], operation: (item: T) => R | Promise<R>): Promise<R[]> {
  const pool = new ThreadPool({ maxThreads: 4 });
  try {
    return await pool.parallel(items, operation);
  } finally {
    await pool.shutdown();
  }
}

export async function parallelMap<T, R>(items: T[], mapper: (item: T, index: number) => R | Promise<R>): Promise<R[]> {
  const pool = new ThreadPool({ maxThreads: 4 });
  try {
    return await pool.map(items, mapper);
  } finally {
    await pool.shutdown();
  }
}

export async function parallelReduce<T, R>(items: T[], reducer: (acc: R, item: T, index: number) => R, initialValue: R): Promise<R> {
  const pool = new ThreadPool({ maxThreads: 4 });
  try {
    return await pool.reduce(items, reducer, initialValue);
  } finally {
    await pool.shutdown();
  }
}
