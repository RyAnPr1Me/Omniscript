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
    };
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
