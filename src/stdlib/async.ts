import { debug } from '../debug';

export interface RetryOptions {
  maxRetries: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  backoffFactor?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

export interface TimeoutOptions {
  signal?: AbortSignal;
}

export interface RateLimiterOptions {
  maxConcurrent: number;
  interval: number; // milliseconds
  maxPerInterval: number;
}

export class AsyncUtils {
  /**
   * Sleep for specified milliseconds
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Add timeout to a promise
   */
  static timeout<T>(promise: Promise<T>, ms: number, options?: TimeoutOptions): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }, ms);

      // Handle abort signal
      if (options?.signal) {
        options.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Operation aborted'));
        });
      }
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Retry a function with configurable options
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        if (options.shouldRetry && !options.shouldRetry(error, attempt)) {
          throw error;
        }
        
        // Don't wait after the last attempt
        if (attempt === options.maxRetries) {
          break;
        }
        
        // Calculate delay
        let delay = options.delay || 1000;
        if (options.backoff === 'exponential') {
          const factor = options.backoffFactor || 2;
          delay = delay * Math.pow(factor, attempt);
        } else if (options.backoff === 'linear') {
          const factor = options.backoffFactor || 1;
          delay = delay * (1 + attempt * factor);
        }
        
        debug.warn('AsyncUtils', `Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${error}`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Execute promises with limited concurrency
   */
  static async parallel<T>(
    tasks: (() => Promise<T>)[],
    maxConcurrency: number = 5
  ): Promise<T[]> {
    const results: T[] = new Array(tasks.length);
    const executing: Promise<void>[] = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const promise = task().then(result => {
        results[i] = result;
      });
      
      executing.push(promise);
      
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        // Remove completed promises
        const completedIndex = executing.findIndex(p => 
          (p as any).isFulfilled || (p as any).isRejected
        );
        if (completedIndex >= 0) {
          executing.splice(completedIndex, 1);
        }
      }
    }
    
    await Promise.all(executing);
    return results;
  }

  /**
   * Execute promises in sequence (one after another)
   */
  static async sequence<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = [];
    
    for (const task of tasks) {
      const result = await task();
      results.push(result);
    }
    
    return results;
  }

  /**
   * Debounce a function call
   */
  static debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ): T {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return ((...args: any[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        fn(...args);
      }, delay);
    }) as T;
  }

  /**
   * Throttle a function call
   */
  static throttle<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ): T {
    let lastCall = 0;
    
    return ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    }) as T;
  }

  /**
   * Create a simple rate limiter
   */
  static createRateLimiter(options: RateLimiterOptions) {
    const { maxConcurrent, interval, maxPerInterval } = options;
    let currentlyExecuting = 0;
    let callsInInterval = 0;
    let intervalStart = Date.now();
    const queue: (() => void)[] = [];

    const processQueue = () => {
      const now = Date.now();
      
      // Reset interval counter if interval has passed
      if (now - intervalStart >= interval) {
        callsInInterval = 0;
        intervalStart = now;
      }
      
      // Process queued items if we can
      while (
        queue.length > 0 &&
        currentlyExecuting < maxConcurrent &&
        callsInInterval < maxPerInterval
      ) {
        const next = queue.shift()!;
        currentlyExecuting++;
        callsInInterval++;
        next();
      }
    };

    return {
      async execute<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
          const executeFunction = async () => {
            try {
              const result = await fn();
              resolve(result);
            } catch (error) {
              reject(error);
            } finally {
              currentlyExecuting--;
              // Process queue after completion
              setTimeout(processQueue, 0);
            }
          };

          queue.push(executeFunction);
          processQueue();
        });
      },
      
      get queueLength() {
        return queue.length;
      },
      
      get executing() {
        return currentlyExecuting;
      }
    };
  }

  /**
   * Poll a function until it returns a truthy value or times out
   */
  static async poll<T>(
    fn: () => Promise<T> | T,
    options: {
      interval?: number;
      timeout?: number;
      condition?: (result: T) => boolean;
    } = {}
  ): Promise<T> {
    const { interval = 1000, timeout = 30000, condition = (result) => !!result } = options;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const result = await fn();
      
      if (condition(result)) {
        return result;
      }
      
      await this.sleep(interval);
    }
    
    throw new Error(`Polling timed out after ${timeout}ms`);
  }

  /**
   * Create a promise that resolves to the first resolved value
   */
  static async first<T>(promises: Promise<T>[]): Promise<T> {
    return new Promise((resolve, reject) => {
      let rejectionCount = 0;
      const errors: any[] = [];
      
      for (const promise of promises) {
        promise
          .then(resolve)
          .catch(error => {
            errors.push(error);
            rejectionCount++;
            
            if (rejectionCount === promises.length) {
              reject(new Error(`All promises rejected: ${errors.map(e => e.message).join(', ')}`));
            }
          });
      }
    });
  }

  /**
   * Create a promise that resolves when all promises settle (succeed or fail)
   */
  static async allSettled<T>(promises: Promise<T>[]): Promise<Array<{
    status: 'fulfilled' | 'rejected';
    value?: T;
    reason?: any;
  }>> {
    return Promise.all(
      promises.map(promise =>
        promise
          .then(value => ({ status: 'fulfilled' as const, value }))
          .catch(reason => ({ status: 'rejected' as const, reason }))
      )
    );
  }

  /**
   * Wrap a callback-based function to return a promise
   */
  static promisify<T extends (...args: any[]) => void>(
    fn: T
  ): (...args: any[]) => Promise<any> {
    return (...args: any[]) => {
      return new Promise((resolve, reject) => {
        fn(...args, (error: any, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    };
  }

  /**
   * Create a cancellable promise
   */
  static cancellable<T>(
    executor: (resolve: (value: T) => void, reject: (reason: any) => void, signal: AbortSignal) => void
  ): {
    promise: Promise<T>;
    cancel: () => void;
  } {
    const controller = new AbortController();
    
    const promise = new Promise<T>((resolve, reject) => {
      executor(resolve, reject, controller.signal);
      
      controller.signal.addEventListener('abort', () => {
        reject(new Error('Operation cancelled'));
      });
    });
    
    return {
      promise,
      cancel: () => controller.abort()
    };
  }

  /**
   * Memoize async function results
   */
  static memoizeAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyFn?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, Promise<any>>();
    
    return ((...args: Parameters<T>) => {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      
      const promise = fn(...args).catch(error => {
        // Remove failed promises from cache
        cache.delete(key);
        throw error;
      });
      
      cache.set(key, promise);
      return promise;
    }) as T;
  }

  /**
   * Create a promise that resolves after a delay
   */
  static delay<T>(ms: number, value?: T): Promise<T | undefined> {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
  }

  /**
   * Execute a function and measure its execution time
   */
  static async measure<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    return { result, duration };
  }
}

/**
 * Advanced async patterns and utilities - Extended
 */
class AsyncPatterns {
  /**
   * Create a cancellable async operation
   */
  static cancellable<T>(operation: (signal: AbortSignal) => Promise<T>): {
    promise: Promise<T>;
    cancel: () => void;
  } {
    const controller = new AbortController();
    const promise = operation(controller.signal);
    
    return {
      promise,
      cancel: () => controller.abort()
    };
  }

  /**
   * Create an async pipeline with transformation steps
   */
  static pipeline<T, U>(
    input: T,
    ...steps: Array<(value: any) => Promise<any> | any>
  ): Promise<U> {
    return steps.reduce(
      async (acc, step) => step(await acc),
      Promise.resolve(input)
    );
  }

  /**
   * Async reduce with concurrency control
   */
  static async reduce<T, U>(
    items: T[],
    reducer: (acc: U, item: T, index: number) => Promise<U>,
    initialValue: U,
    concurrency: number = 1
  ): Promise<U> {
    if (concurrency === 1) {
      let accumulator = initialValue;
      for (let i = 0; i < items.length; i++) {
        accumulator = await reducer(accumulator, items[i], i);
      }
      return accumulator;
    }

    // For concurrent reduce, we need to batch items
    let accumulator = initialValue;
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const promises = batch.map((item, batchIndex) => 
        reducer(accumulator, item, i + batchIndex)
      );
      
      const results = await Promise.all(promises);
      accumulator = results[results.length - 1]; // Use the last result as accumulator
    }
    
    return accumulator;
  }

  /**
   * Create an async queue with processing function
   */
  static createQueue<T, U>(
    processor: (item: T) => Promise<U>,
    options: {
      concurrency?: number;
      onSuccess?: (result: U, item: T) => void;
      onError?: (error: Error, item: T) => void;
    } = {}
  ): {
    add: (item: T) => Promise<U>;
    size: () => number;
    pending: () => number;
    clear: () => void;
  } {
    const { concurrency = 1, onSuccess, onError } = options;
    const queue: Array<{
      item: T;
      resolve: (value: U) => void;
      reject: (error: Error) => void;
    }> = [];
    let processing = 0;

    const processNext = async () => {
      if (queue.length === 0 || processing >= concurrency) return;
      
      processing++;
      const { item, resolve, reject } = queue.shift()!;
      
      try {
        const result = await processor(item);
        onSuccess?.(result, item);
        resolve(result);
      } catch (error) {
        onError?.(error as Error, item);
        reject(error as Error);
      } finally {
        processing--;
        processNext(); // Process next item
      }
    };

    return {
      add: (item: T): Promise<U> => {
        return new Promise((resolve, reject) => {
          queue.push({ item, resolve, reject });
          processNext();
        });
      },
      size: () => queue.length,
      pending: () => processing,
      clear: () => {
        queue.length = 0;
      }
    };
  }

  /**
   * Create a semaphore for resource limiting
   */
  static createSemaphore(permits: number): {
    acquire: () => Promise<() => void>;
    available: () => number;
  } {
    let available = permits;
    const waiters: Array<() => void> = [];

    const tryAcquire = (): (() => void) | null => {
      if (available > 0) {
        available--;
        return () => {
          available++;
          if (waiters.length > 0) {
            const waiter = waiters.shift()!;
            waiter();
          }
        };
      }
      return null;
    };

    return {
      acquire: (): Promise<() => void> => {
        const release = tryAcquire();
        if (release) {
          return Promise.resolve(release);
        }

        return new Promise<() => void>((resolve) => {
          waiters.push(() => {
            const release = tryAcquire();
            if (release) {
              resolve(release);
            }
          });
        });
      },
      available: () => available
    };
  }

  /**
   * Create a circuit breaker for fault tolerance
   */
  static createCircuitBreaker<T extends any[], U>(
    fn: (...args: T) => Promise<U>,
    options: {
      failureThreshold?: number;
      recoveryTimeout?: number;
      monitoringPeriod?: number;
    } = {}
  ): {
    execute: (...args: T) => Promise<U>;
    state: () => 'closed' | 'open' | 'half-open';
    reset: () => void;
  } {
    const {
      failureThreshold = 5,
      recoveryTimeout = 10000,
      monitoringPeriod = 60000
    } = options;

    let state: 'closed' | 'open' | 'half-open' = 'closed';
    let failures = 0;
    let lastFailureTime = 0;
    let successes = 0;

    const canExecute = (): boolean => {
      if (state === 'closed') return true;
      if (state === 'open') {
        return Date.now() - lastFailureTime > recoveryTimeout;
      }
      return true; // half-open
    };

    const onSuccess = () => {
      failures = 0;
      successes++;
      if (state === 'half-open') {
        state = 'closed';
      }
    };

    const onFailure = () => {
      failures++;
      lastFailureTime = Date.now();
      if (failures >= failureThreshold) {
        state = 'open';
      }
    };

    return {
      execute: async (...args: T): Promise<U> => {
        if (!canExecute()) {
          throw new Error('Circuit breaker is open');
        }

        if (state === 'open') {
          state = 'half-open';
        }

        try {
          const result = await fn(...args);
          onSuccess();
          return result;
        } catch (error) {
          onFailure();
          throw error;
        }
      },
      state: () => state,
      reset: () => {
        state = 'closed';
        failures = 0;
        successes = 0;
      }
    };
  }

  /**
   * Race multiple async operations, return first N results
   */
  static async raceN<T>(
    promises: Promise<T>[],
    count: number
  ): Promise<T[]> {
    if (count <= 0) return [];
    if (count >= promises.length) return Promise.all(promises);

    return new Promise((resolve, reject) => {
      const results: T[] = [];
      let completed = 0;
      let rejected = 0;

      promises.forEach((promise, index) => {
        promise
          .then((result) => {
            if (results.length < count) {
              results.push(result);
              completed++;
              
              if (completed === count) {
                resolve(results);
              }
            }
          })
          .catch((error) => {
            rejected++;
            if (rejected === promises.length - count + 1) {
              reject(new Error('Not enough promises resolved'));
            }
          });
      });
    });
  }
}

// Convenience exports
export const { sleep, timeout, retry, parallel, sequence, debounce, throttle, poll, delay } = AsyncUtils;

export default AsyncUtils;
export { AsyncPatterns };