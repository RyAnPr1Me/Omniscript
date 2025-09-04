import { debug } from "../debug";

export type Subscription = () => void;
export type Observer<T> = (value: T) => void;
export type ErrorHandler = (error: Error) => void;
export type CompleteHandler = () => void;

export interface Observable<T> {
  subscribe(
    observer: Observer<T>,
    error?: ErrorHandler,
    complete?: CompleteHandler,
  ): Subscription;
  map<R>(fn: (value: T) => R): Observable<R>;
  filter(fn: (value: T) => boolean): Observable<T>;
  distinctUntilChanged(compareFn?: (a: T, b: T) => boolean): Observable<T>;
  debounce(delay: number): Observable<T>;
  throttle(delay: number): Observable<T>;
  scan<R>(fn: (acc: R, value: T) => R, seed: R): Observable<R>;
  take(count: number): Observable<T>;
  takeUntil<U>(notifier: Observable<U>): Observable<T>;
  combineWith<U, R>(
    other: Observable<U>,
    combiner: (a: T, b: U) => R,
  ): Observable<R>;
  merge(other: Observable<T>): Observable<T>;
  switchMap<R>(fn: (value: T) => Observable<R>): Observable<R>;
  share(): Observable<T>;
  
  // Advanced stream processing operators
  buffer(size: number): Observable<T[]>;
  bufferTime(timespan: number): Observable<T[]>;
  bufferCount(count: number, startBufferEvery?: number): Observable<T[]>;
  window(size: number): Observable<Observable<T>>;
  groupBy<K>(keySelector: (value: T) => K): Observable<{ key: K; values: Observable<T> }>;
  partition(predicate: (value: T) => boolean): [Observable<T>, Observable<T>];
  reduce<R>(accumulator: (acc: R, value: T, index: number) => R, seed?: R): Observable<R>;
  concatMap<R>(fn: (value: T) => Observable<R>): Observable<R>;
  mergeMap<R>(fn: (value: T) => Observable<R>, concurrent?: number): Observable<R>;
  exhaustMap<R>(fn: (value: T) => Observable<R>): Observable<R>;
  retry(count?: number): Observable<T>;
  retryWhen<R>(notifier: (errors: Observable<Error>) => Observable<R>): Observable<T>;
  timeout(due: number, scheduler?: any): Observable<T>;
  delay(delay: number): Observable<T>;
  sample<U>(notifier: Observable<U>): Observable<T>;
  auditTime(duration: number): Observable<T>;
  distinct<K>(keySelector?: (value: T) => K): Observable<T>;
  skip(count: number): Observable<T>;
  skipUntil<U>(notifier: Observable<U>): Observable<T>;
  skipWhile(predicate: (value: T) => boolean): Observable<T>;
  takeWhile(predicate: (value: T) => boolean): Observable<T>;
  expand<R>(project: (value: T) => Observable<R>, concurrent?: number): Observable<R>;
  pairwise(): Observable<[T, T]>;
  startWith(...values: T[]): Observable<T>;
  endWith(...values: T[]): Observable<T>;
  defaultIfEmpty(defaultValue: T): Observable<T>;
  catchError<R>(selector: (error: Error) => Observable<R>): Observable<T | R>;
}

export class Stream<T> implements Observable<T> {
  protected observers: Observer<T>[] = [];
  protected errorHandlers: ErrorHandler[] = [];
  protected completeHandlers: CompleteHandler[] = [];
  protected isCompleted: boolean = false;
  protected hasError: boolean = false;
  protected lastError?: Error;

  subscribe(
    observer: Observer<T>,
    error?: ErrorHandler,
    complete?: CompleteHandler,
  ): Subscription {
    if (this.isCompleted) {
      if (complete) complete();
      return () => {};
    }

    if (this.hasError && error) {
      error(this.lastError!);
      return () => {};
    }

    this.observers.push(observer);
    if (error) this.errorHandlers.push(error);
    if (complete) this.completeHandlers.push(complete);

    return () => {
      this.observers = this.observers.filter((obs) => obs !== observer);
      if (error)
        this.errorHandlers = this.errorHandlers.filter((err) => err !== error);
      if (complete)
        this.completeHandlers = this.completeHandlers.filter(
          (comp) => comp !== complete,
        );
    };
  }

  next(value: T): void {
    if (this.isCompleted || this.hasError) return;

    this.observers.forEach((observer) => {
      try {
        observer(value);
      } catch (error) {
        this.error(error as Error);
      }
    });
  }

  error(error: Error): void {
    if (this.isCompleted || this.hasError) return;

    this.hasError = true;
    this.lastError = error;
    this.errorHandlers.forEach((handler) => handler(error));
    this.cleanup();
  }

  complete(): void {
    if (this.isCompleted || this.hasError) return;

    this.isCompleted = true;
    this.completeHandlers.forEach((handler) => handler());
    this.cleanup();
  }

  private cleanup(): void {
    this.observers = [];
    this.errorHandlers = [];
    this.completeHandlers = [];
  }

  // Transformation operators
  map<R>(fn: (value: T) => R): Observable<R> {
    const mapped = new Stream<R>();

    this.subscribe(
      (value) => {
        try {
          mapped.next(fn(value));
        } catch (error) {
          mapped.error(error as Error);
        }
      },
      (error) => mapped.error(error),
      () => mapped.complete(),
    );

    return mapped;
  }

  filter(fn: (value: T) => boolean): Observable<T> {
    const filtered = new Stream<T>();

    this.subscribe(
      (value) => {
        try {
          if (fn(value)) {
            filtered.next(value);
          }
        } catch (error) {
          filtered.error(error as Error);
        }
      },
      (error) => filtered.error(error),
      () => filtered.complete(),
    );

    return filtered;
  }

  distinctUntilChanged(
    compareFn: (a: T, b: T) => boolean = (a, b) => a === b,
  ): Observable<T> {
    const distinct = new Stream<T>();
    let hasValue = false;
    let lastValue: T;

    this.subscribe(
      (value) => {
        if (!hasValue || !compareFn(lastValue, value)) {
          hasValue = true;
          lastValue = value;
          distinct.next(value);
        }
      },
      (error) => distinct.error(error),
      () => distinct.complete(),
    );

    return distinct;
  }

  debounce(delay: number): Observable<T> {
    const debounced = new Stream<T>();
    let timeoutId: NodeJS.Timeout | null = null;

    this.subscribe(
      (value) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          debounced.next(value);
          timeoutId = null;
        }, delay);
      },
      (error) => debounced.error(error),
      () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        debounced.complete();
      },
    );

    return debounced;
  }

  throttle(delay: number): Observable<T> {
    const throttled = new Stream<T>();
    let lastEmitTime = 0;

    this.subscribe(
      (value) => {
        const now = Date.now();
        if (now - lastEmitTime >= delay) {
          lastEmitTime = now;
          throttled.next(value);
        }
      },
      (error) => throttled.error(error),
      () => throttled.complete(),
    );

    return throttled;
  }

  scan<R>(fn: (acc: R, value: T) => R, seed: R): Observable<R> {
    const scanned = new Stream<R>();
    let accumulator = seed;

    this.subscribe(
      (value) => {
        try {
          accumulator = fn(accumulator, value);
          scanned.next(accumulator);
        } catch (error) {
          scanned.error(error as Error);
        }
      },
      (error) => scanned.error(error),
      () => scanned.complete(),
    );

    return scanned;
  }

  take(count: number): Observable<T> {
    const taken = new Stream<T>();
    let taken_count = 0;

    const subscription = this.subscribe(
      (value) => {
        if (taken_count < count) {
          taken.next(value);
          taken_count++;
          if (taken_count >= count) {
            taken.complete();
            subscription();
          }
        }
      },
      (error) => taken.error(error),
      () => taken.complete(),
    );

    return taken;
  }

  takeUntil<U>(notifier: Observable<U>): Observable<T> {
    const taken = new Stream<T>();

    const subscription = this.subscribe(
      (value) => taken.next(value),
      (error) => taken.error(error),
      () => taken.complete(),
    );

    const notifierSubscription = notifier.subscribe(() => {
      taken.complete();
      subscription();
      notifierSubscription();
    });

    return taken;
  }

  combineWith<U, R>(
    other: Observable<U>,
    combiner: (a: T, b: U) => R,
  ): Observable<R> {
    const combined = new Stream<R>();
    let hasValueA = false;
    let hasValueB = false;
    let lastValueA: T;
    let lastValueB: U;

    const emitIfReady = () => {
      if (hasValueA && hasValueB) {
        try {
          combined.next(combiner(lastValueA, lastValueB));
        } catch (error) {
          combined.error(error as Error);
        }
      }
    };

    this.subscribe(
      (value) => {
        hasValueA = true;
        lastValueA = value;
        emitIfReady();
      },
      (error) => combined.error(error),
    );

    other.subscribe(
      (value) => {
        hasValueB = true;
        lastValueB = value;
        emitIfReady();
      },
      (error) => combined.error(error),
    );

    return combined;
  }

  merge(other: Observable<T>): Observable<T> {
    const merged = new Stream<T>();

    this.subscribe(
      (value) => merged.next(value),
      (error) => merged.error(error),
    );

    other.subscribe(
      (value) => merged.next(value),
      (error) => merged.error(error),
    );

    return merged;
  }

  switchMap<R>(fn: (value: T) => Observable<R>): Observable<R> {
    const switched = new Stream<R>();
    let innerSubscription: Subscription | null = null;

    this.subscribe(
      (value) => {
        if (innerSubscription) {
          innerSubscription();
        }

        try {
          const inner = fn(value);
          innerSubscription = inner.subscribe(
            (innerValue) => switched.next(innerValue),
            (error) => switched.error(error),
          );
        } catch (error) {
          switched.error(error as Error);
        }
      },
      (error) => switched.error(error),
      () => switched.complete(),
    );

    return switched;
  }

  share(): Observable<T> {
    const shared = new Stream<T>();
    let refCount = 0;
    let subscription: Subscription | null = null;

    return {
      subscribe: (
        observer: Observer<T>,
        error?: ErrorHandler,
        complete?: CompleteHandler,
      ) => {
        refCount++;

        if (refCount === 1) {
          subscription = this.subscribe(
            (value) => shared.next(value),
            (err) => shared.error(err),
            () => shared.complete(),
          );
        }

        const innerSub = shared.subscribe(observer, error, complete);

        return () => {
          innerSub();
          refCount--;
          if (refCount === 0 && subscription) {
            subscription();
            subscription = null;
          }
        };
      },
      map: shared.map.bind(shared),
      filter: shared.filter.bind(shared),
      distinctUntilChanged: shared.distinctUntilChanged.bind(shared),
      debounce: shared.debounce.bind(shared),
      throttle: shared.throttle.bind(shared),
      scan: shared.scan.bind(shared),
      take: shared.take.bind(shared),
      takeUntil: shared.takeUntil.bind(shared),
      combineWith: shared.combineWith.bind(shared),
      merge: shared.merge.bind(shared),
      switchMap: shared.switchMap.bind(shared),
      share: shared.share.bind(shared),
      // Advanced operators
      buffer: shared.buffer?.bind(shared),
      bufferTime: shared.bufferTime?.bind(shared),
      bufferCount: shared.bufferCount?.bind(shared),
      window: shared.window?.bind(shared),
      groupBy: shared.groupBy?.bind(shared),
      partition: shared.partition?.bind(shared),
      reduce: shared.reduce?.bind(shared),
      concatMap: shared.concatMap?.bind(shared),
      mergeMap: shared.mergeMap?.bind(shared),
      exhaustMap: shared.exhaustMap?.bind(shared),
      retry: shared.retry?.bind(shared),
      retryWhen: shared.retryWhen?.bind(shared),
      timeout: shared.timeout?.bind(shared),
      delay: shared.delay?.bind(shared),
      sample: shared.sample?.bind(shared),
      auditTime: shared.auditTime?.bind(shared),
      distinct: shared.distinct?.bind(shared),
      skip: shared.skip?.bind(shared),
      skipUntil: shared.skipUntil?.bind(shared),
      skipWhile: shared.skipWhile?.bind(shared),
      takeWhile: shared.takeWhile?.bind(shared),
      expand: shared.expand?.bind(shared),
      pairwise: shared.pairwise?.bind(shared),
      startWith: shared.startWith?.bind(shared),
      endWith: shared.endWith?.bind(shared),
      defaultIfEmpty: shared.defaultIfEmpty?.bind(shared),
      catchError: shared.catchError?.bind(shared),
    };
  }

  // Advanced stream processing operators implementations
  buffer(size: number): Observable<T[]> {
    const buffered = new Stream<T[]>();
    let buffer: T[] = [];

    this.subscribe(
      (value) => {
        buffer.push(value);
        if (buffer.length >= size) {
          buffered.next([...buffer]);
          buffer = [];
        }
      },
      (error) => buffered.error(error),
      () => {
        if (buffer.length > 0) {
          buffered.next(buffer);
        }
        buffered.complete();
      }
    );

    return buffered;
  }

  bufferTime(timespan: number): Observable<T[]> {
    const buffered = new Stream<T[]>();
    let buffer: T[] = [];

    const emitBuffer = () => {
      if (buffer.length > 0) {
        buffered.next([...buffer]);
        buffer = [];
      }
    };

    const intervalId = setInterval(emitBuffer, timespan);

    this.subscribe(
      (value) => buffer.push(value),
      (error) => {
        clearInterval(intervalId);
        buffered.error(error);
      },
      () => {
        clearInterval(intervalId);
        emitBuffer();
        buffered.complete();
      }
    );

    return buffered;
  }

  bufferCount(count: number, startBufferEvery?: number): Observable<T[]> {
    const buffered = new Stream<T[]>();
    const buffers: T[][] = [];
    const startEvery = startBufferEvery || count;
    let index = 0;

    this.subscribe(
      (value) => {
        if (index % startEvery === 0) {
          buffers.push([]);
        }

        for (let i = buffers.length - 1; i >= 0; i--) {
          buffers[i].push(value);
          if (buffers[i].length === count) {
            buffered.next(buffers.splice(i, 1)[0]);
          }
        }

        index++;
      },
      (error) => buffered.error(error),
      () => {
        buffers.forEach(buffer => {
          if (buffer.length > 0) buffered.next(buffer);
        });
        buffered.complete();
      }
    );

    return buffered;
  }

  groupBy<K>(keySelector: (value: T) => K): Observable<{ key: K; values: Observable<T> }> {
    const grouped = new Stream<{ key: K; values: Observable<T> }>();
    const groups = new Map<K, Stream<T>>();

    this.subscribe(
      (value) => {
        const key = keySelector(value);
        let group = groups.get(key);

        if (!group) {
          group = new Stream<T>();
          groups.set(key, group);
          grouped.next({ key, values: group });
        }

        group.next(value);
      },
      (error) => {
        groups.forEach(group => group.error(error));
        grouped.error(error);
      },
      () => {
        groups.forEach(group => group.complete());
        grouped.complete();
      }
    );

    return grouped;
  }

  partition(predicate: (value: T) => boolean): [Observable<T>, Observable<T>] {
    const truthy = new Stream<T>();
    const falsy = new Stream<T>();

    this.subscribe(
      (value) => {
        if (predicate(value)) {
          truthy.next(value);
        } else {
          falsy.next(value);
        }
      },
      (error) => {
        truthy.error(error);
        falsy.error(error);
      },
      () => {
        truthy.complete();
        falsy.complete();
      }
    );

    return [truthy, falsy];
  }

  reduce<R>(accumulator: (acc: R, value: T, index: number) => R, seed?: R): Observable<R> {
    const reduced = new Stream<R>();
    let hasValue = false;
    let acc: R;
    let index = 0;

    if (seed !== undefined) {
      hasValue = true;
      acc = seed;
    }

    this.subscribe(
      (value) => {
        if (!hasValue) {
          hasValue = true;
          acc = value as any;
        } else {
          acc = accumulator(acc, value, index);
        }
        index++;
      },
      (error) => reduced.error(error),
      () => {
        if (hasValue) {
          reduced.next(acc);
        }
        reduced.complete();
      }
    );

    return reduced;
  }

  retry(count = 3): Observable<T> {
    const retried = new Stream<T>();
    let attempts = 0;

    const attempt = () => {
      this.subscribe(
        (value) => retried.next(value),
        (error) => {
          attempts++;
          if (attempts < count) {
            setTimeout(attempt, 100 * attempts); // Exponential backoff
          } else {
            retried.error(error);
          }
        },
        () => retried.complete()
      );
    };

    attempt();
    return retried;
  }

  delay(delayTime: number): Observable<T> {
    const delayed = new Stream<T>();

    this.subscribe(
      (value) => {
        setTimeout(() => delayed.next(value), delayTime);
      },
      (error) => delayed.error(error),
      () => {
        setTimeout(() => delayed.complete(), delayTime);
      }
    );

    return delayed;
  }

  distinct<K>(keySelector?: (value: T) => K): Observable<T> {
    const distincted = new Stream<T>();
    const seen = new Set<K | T>();

    this.subscribe(
      (value) => {
        const key = keySelector ? keySelector(value) : value;
        if (!seen.has(key)) {
          seen.add(key);
          distincted.next(value);
        }
      },
      (error) => distincted.error(error),
      () => distincted.complete()
    );

    return distincted;
  }

  skip(count: number): Observable<T> {
    const skipped = new Stream<T>();
    let skippedCount = 0;

    this.subscribe(
      (value) => {
        if (skippedCount >= count) {
          skipped.next(value);
        } else {
          skippedCount++;
        }
      },
      (error) => skipped.error(error),
      () => skipped.complete()
    );

    return skipped;
  }

  pairwise(): Observable<[T, T]> {
    const paired = new Stream<[T, T]>();
    let hasPrevious = false;
    let previous: T;

    this.subscribe(
      (value) => {
        if (hasPrevious) {
          paired.next([previous, value]);
        }
        previous = value;
        hasPrevious = true;
      },
      (error) => paired.error(error),
      () => paired.complete()
    );

    return paired;
  }

  startWith(...values: T[]): Observable<T> {
    const started = new Stream<T>();

    // Emit starting values immediately, asynchronously
    setTimeout(() => {
      values.forEach(value => started.next(value));
      
      // Then subscribe to source
      this.subscribe(
        (value) => started.next(value),
        (error) => started.error(error),
        () => started.complete()
      );
    }, 0);

    return started;
  }

  defaultIfEmpty(defaultValue: T): Observable<T> {
    const defaulted = new Stream<T>();
    let hasEmitted = false;

    this.subscribe(
      (value) => {
        hasEmitted = true;
        defaulted.next(value);
      },
      (error) => defaulted.error(error),
      () => {
        if (!hasEmitted) {
          defaulted.next(defaultValue);
        }
        defaulted.complete();
      }
    );

    return defaulted;
  }

  // Stub implementations for remaining operators (can be enhanced later)
  window(size: number): Observable<Observable<T>> {
    throw new Error("window operator not yet implemented");
  }

  concatMap<R>(fn: (value: T) => Observable<R>): Observable<R> {
    const result = new Stream<R>();
    let currentIndex = 0;
    const values: T[] = [];

    const processNext = () => {
      if (currentIndex < values.length) {
        const inner = fn(values[currentIndex]);
        inner.subscribe(
          (value) => result.next(value),
          (error) => result.error(error),
          () => {
            currentIndex++;
            processNext();
          }
        );
      } else {
        result.complete();
      }
    };

    this.subscribe(
      (value) => values.push(value),
      (error) => result.error(error),
      () => processNext()
    );

    return result;
  }

  mergeMap<R>(fn: (value: T) => Observable<R>, concurrent = Infinity): Observable<R> {
    const result = new Stream<R>();
    let activeCount = 0;
    let completed = false;

    this.subscribe(
      (value) => {
        if (activeCount < concurrent) {
          activeCount++;
          const inner = fn(value);
          inner.subscribe(
            (innerValue) => result.next(innerValue),
            (error) => result.error(error),
            () => {
              activeCount--;
              if (completed && activeCount === 0) {
                result.complete();
              }
            }
          );
        }
      },
      (error) => result.error(error),
      () => {
        completed = true;
        if (activeCount === 0) {
          result.complete();
        }
      }
    );

    return result;
  }

  exhaustMap<R>(fn: (value: T) => Observable<R>): Observable<R> {
    const result = new Stream<R>();
    let innerActive = false;

    this.subscribe(
      (value) => {
        if (!innerActive) {
          innerActive = true;
          const inner = fn(value);
          inner.subscribe(
            (innerValue) => result.next(innerValue),
            (error) => result.error(error),
            () => { innerActive = false; }
          );
        }
      },
      (error) => result.error(error),
      () => result.complete()
    );

    return result;
  }

  retryWhen<R>(notifier: (errors: Observable<Error>) => Observable<R>): Observable<T> {
    throw new Error("retryWhen operator not yet implemented");
  }

  timeout(due: number): Observable<T> {
    const result = new Stream<T>();
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        result.error(new Error("Timeout"));
      }, due);
    };

    resetTimeout();

    this.subscribe(
      (value) => {
        resetTimeout();
        result.next(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        result.error(error);
      },
      () => {
        clearTimeout(timeoutId);
        result.complete();
      }
    );

    return result;
  }

  sample<U>(notifier: Observable<U>): Observable<T> {
    const result = new Stream<T>();
    let lastValue: T;
    let hasValue = false;

    this.subscribe(
      (value) => {
        lastValue = value;
        hasValue = true;
      },
      (error) => result.error(error)
    );

    notifier.subscribe(
      () => {
        if (hasValue) {
          result.next(lastValue);
        }
      },
      (error) => result.error(error),
      () => result.complete()
    );

    return result;
  }

  auditTime(duration: number): Observable<T> {
    const result = new Stream<T>();
    let lastValue: T;
    let hasValue = false;
    let timeoutId: NodeJS.Timeout | null = null;

    this.subscribe(
      (value) => {
        lastValue = value;
        hasValue = true;

        if (!timeoutId) {
          timeoutId = setTimeout(() => {
            if (hasValue) {
              result.next(lastValue);
              hasValue = false;
            }
            timeoutId = null;
          }, duration);
        }
      },
      (error) => result.error(error),
      () => result.complete()
    );

    return result;
  }

  skipUntil<U>(notifier: Observable<U>): Observable<T> {
    const result = new Stream<T>();
    let shouldEmit = false;

    notifier.subscribe(() => { shouldEmit = true; });

    this.subscribe(
      (value) => {
        if (shouldEmit) {
          result.next(value);
        }
      },
      (error) => result.error(error),
      () => result.complete()
    );

    return result;
  }

  skipWhile(predicate: (value: T) => boolean): Observable<T> {
    const result = new Stream<T>();
    let shouldSkip = true;

    this.subscribe(
      (value) => {
        if (shouldSkip && !predicate(value)) {
          shouldSkip = false;
        }
        if (!shouldSkip) {
          result.next(value);
        }
      },
      (error) => result.error(error),
      () => result.complete()
    );

    return result;
  }

  takeWhile(predicate: (value: T) => boolean): Observable<T> {
    const result = new Stream<T>();

    this.subscribe(
      (value) => {
        if (predicate(value)) {
          result.next(value);
        } else {
          result.complete();
        }
      },
      (error) => result.error(error),
      () => result.complete()
    );

    return result;
  }

  expand<R>(project: (value: T) => Observable<R>): Observable<R> {
    throw new Error("expand operator not yet implemented");
  }

  endWith(...values: T[]): Observable<T> {
    const result = new Stream<T>();

    this.subscribe(
      (value) => result.next(value),
      (error) => result.error(error),
      () => {
        values.forEach(value => result.next(value));
        result.complete();
      }
    );

    return result;
  }

  catchError<R>(selector: (error: Error) => Observable<R>): Observable<T | R> {
    const result = new Stream<T | R>();

    this.subscribe(
      (value) => result.next(value),
      (error) => {
        try {
          const recovery = selector(error);
          recovery.subscribe(
            (recoveryValue) => result.next(recoveryValue),
            (recoveryError) => result.error(recoveryError),
            () => result.complete()
          );
        } catch (e) {
          result.error(e as Error);
        }
      },
      () => result.complete()
    );

    return result;
  }
}

export class Subject<T> extends Stream<T> {
  // Subject acts as both Observable and Observer
  // Inherits all Observable methods from Stream
  // Adds the ability to push values from outside
}

export class BehaviorSubject<T> extends Subject<T> {
  private _value: T;

  constructor(initialValue: T) {
    super();
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  next(value: T): void {
    this._value = value;
    super.next(value);
  }

  subscribe(
    observer: Observer<T>,
    error?: ErrorHandler,
    complete?: CompleteHandler,
  ): Subscription {
    const subscription = super.subscribe(observer, error, complete);

    // Emit current value immediately
    try {
      observer(this._value);
    } catch (err) {
      if (error) error(err as Error);
    }

    return subscription;
  }
}

export class Signal<T> {
  private _value: T;
  private stream: BehaviorSubject<T>;

  constructor(initial: T) {
    this._value = initial;
    this.stream = new BehaviorSubject<T>(initial);
  }

  get value(): T {
    return this._value;
  }

  set value(newVal: T) {
    if (this._value !== newVal) {
      this._value = newVal;
      this.stream.next(newVal);
    }
  }

  asObservable(): Observable<T> {
    return this.stream;
  }

  subscribe(
    observer: Observer<T>,
    error?: ErrorHandler,
    complete?: CompleteHandler,
  ): Subscription {
    return this.stream.subscribe(observer, error, complete);
  }

  map<R>(fn: (value: T) => R): Signal<R> {
    const mapped = new Signal(fn(this._value));

    this.subscribe((value) => {
      mapped.value = fn(value);
    });

    return mapped;
  }
}

// Reactive state management
export class ReactiveState<T> {
  private state: Signal<T>;
  private computed: Map<string, Signal<any>> = new Map();
  private effects: Map<string, Subscription> = new Map();
  private middleware: ((oldState: T, newState: T, action: string) => T)[] = [];

  constructor(initialState: T) {
    this.state = new Signal(initialState);
    debug.info("Reactive", "ReactiveState initialized");
  }

  getState(): T {
    return this.state.value;
  }

  setState(newState: Partial<T>, action: string = "setState"): void {
    const oldState = this.state.value;
    const mergedState = { ...oldState, ...newState };

    // Apply middleware
    const finalState = this.middleware.reduce(
      (state, middleware) => middleware(oldState, state, action),
      mergedState,
    );

    this.state.value = finalState;
    debug.debug("Reactive", `State updated via ${action}`);
  }

  select<R>(selector: (state: T) => R): Observable<R> {
    return this.state.asObservable().map(selector).distinctUntilChanged();
  }

  addComputed<R>(name: string, fn: (state: T) => R): Signal<R> {
    const computed = new Signal(fn(this.state.value));

    this.state.subscribe((state) => {
      computed.value = fn(state);
    });

    this.computed.set(name, computed);
    debug.debug("Reactive", `Computed property added: ${name}`);

    return computed;
  }

  addEffect(name: string, fn: (state: T) => void): void {
    const subscription = this.state.subscribe(fn);
    this.effects.set(name, subscription);
    debug.debug("Reactive", `Effect added: ${name}`);
  }

  removeEffect(name: string): void {
    const subscription = this.effects.get(name);
    if (subscription) {
      subscription();
      this.effects.delete(name);
      debug.debug("Reactive", `Effect removed: ${name}`);
    }
  }

  addMiddleware(
    middleware: (oldState: T, newState: T, action: string) => T,
  ): void {
    this.middleware.push(middleware);
    debug.debug("Reactive", "Middleware added");
  }

  dispose(): void {
    this.effects.forEach((subscription) => subscription());
    this.effects.clear();
    this.computed.clear();
    debug.info("Reactive", "ReactiveState disposed");
  }
}

// Utility functions
export function from<T>(values: T[]): Observable<T> {
  const stream = new Stream<T>();

  setTimeout(() => {
    values.forEach((value) => stream.next(value));
    stream.complete();
  }, 0);

  return stream;
}

export function interval(delay: number): Observable<number> {
  const stream = new Stream<number>();
  let count = 0;

  const timer = setInterval(() => {
    stream.next(count++);
  }, delay);

  // Clean up on completion or error
  stream.subscribe(
    () => {},
    () => clearInterval(timer),
    () => clearInterval(timer),
  );

  return stream;
}

export function timer(delay: number): Observable<number> {
  const stream = new Stream<number>();

  setTimeout(() => {
    stream.next(0);
    stream.complete();
  }, delay);

  return stream;
}

export function merge<T>(...observables: Observable<T>[]): Observable<T> {
  const merged = new Stream<T>();

  observables.forEach((obs) => {
    obs.subscribe(
      (value) => merged.next(value),
      (error) => merged.error(error),
    );
  });

  return merged;
}

export function combineLatest<T, U, R>(
  obsA: Observable<T>,
  obsB: Observable<U>,
  combiner: (a: T, b: U) => R,
): Observable<R> {
  return obsA.combineWith(obsB, combiner);
}
