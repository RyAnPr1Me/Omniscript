# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [reactive](#reactive)

## reactive

**File**: `src/stdlib/reactive.ts`

### Classes

#### Stream

**Implements**: `Observable`

**Properties**:

- `observers: Observer<T>[]` - 
- `errorHandlers: ErrorHandler[]` - 
- `completeHandlers: CompleteHandler[]` - 
- `isCompleted: boolean` - 
- `hasError: boolean` - 
- `lastError: Error` - 

**Methods**:

##### subscribe

**Signature**: `subscribe(observer: Observer<T>, error?: ErrorHandler, complete?: CompleteHandler): Subscription`

##### next

**Signature**: `next(value: T): void`

##### error

**Signature**: `error(error: Error): void`

##### complete

**Signature**: `complete(): void`

##### cleanup

**Signature**: `private cleanup(): void`

##### map

**Signature**: `map<R>(fn: (value: T) => R): Observable<R>`

##### filter

**Signature**: `filter(fn: (value: T) => boolean): Observable<T>`

##### distinctUntilChanged

**Signature**: `distinctUntilChanged(compareFn: (a: T, b: T) => boolean = (a, b) => a === b): Observable<T>`

##### debounce

**Signature**: `debounce(delay: number): Observable<T>`

##### throttle

**Signature**: `throttle(delay: number): Observable<T>`

##### scan

**Signature**: `scan<R>(fn: (acc: R, value: T) => R, seed: R): Observable<R>`

##### take

**Signature**: `take(count: number): Observable<T>`

##### takeUntil

**Signature**: `takeUntil<U>(notifier: Observable<U>): Observable<T>`

##### combineWith

**Signature**: `combineWith<U, R>(other: Observable<U>, combiner: (a: T, b: U) => R): Observable<R>`

##### merge

**Signature**: `merge(other: Observable<T>): Observable<T>`

##### switchMap

**Signature**: `switchMap<R>(fn: (value: T) => Observable<R>): Observable<R>`

##### share

**Signature**: `share(): Observable<T>`

#### Subject

**Extends**: `Stream`

#### BehaviorSubject

**Extends**: `Subject`

**Properties**:

- `_value: T` - 

**Methods**:

##### next

**Signature**: `next(value: T): void`

##### subscribe

**Signature**: `subscribe(observer: Observer<T>, error?: ErrorHandler, complete?: CompleteHandler): Subscription`

#### Signal

**Properties**:

- `_value: T` - 
- `stream: BehaviorSubject<T>` - 

**Methods**:

##### asObservable

**Signature**: `asObservable(): Observable<T>`

##### subscribe

**Signature**: `subscribe(observer: Observer<T>, error?: ErrorHandler, complete?: CompleteHandler): Subscription`

##### map

**Signature**: `map<R>(fn: (value: T) => R): Signal<R>`

#### ReactiveState

**Properties**:

- `state: Signal<T>` - 
- `computed: Map<string, Signal<any>>` - 
- `effects: Map<string, Subscription>` - 
- `middleware: ((oldState: T, newState: T, action: string) => T)[]` - 

**Methods**:

##### getState

**Signature**: `getState(): T`

##### setState

**Signature**: `setState(newState: Partial<T>, action: string = 'setState'): void`

##### select

**Signature**: `select<R>(selector: (state: T) => R): Observable<R>`

##### addComputed

**Signature**: `addComputed<R>(name: string, fn: (state: T) => R): Signal<R>`

##### addEffect

**Signature**: `addEffect(name: string, fn: (state: T) => void): void`

##### removeEffect

**Signature**: `removeEffect(name: string): void`

##### addMiddleware

**Signature**: `addMiddleware(middleware: (oldState: T, newState: T, action: string) => T): void`

##### dispose

**Signature**: `dispose(): void`

### Interfaces

#### Observable

**Methods**:

##### subscribe

**Signature**: `subscribe(observer: Observer<T>, error?: ErrorHandler, complete?: CompleteHandler): Subscription;`

##### map

**Signature**: `map<R>(fn: (value: T) => R): Observable<R>;`

##### filter

**Signature**: `filter(fn: (value: T) => boolean): Observable<T>;`

##### distinctUntilChanged

**Signature**: `distinctUntilChanged(compareFn?: (a: T, b: T) => boolean): Observable<T>;`

##### debounce

**Signature**: `debounce(delay: number): Observable<T>;`

##### throttle

**Signature**: `throttle(delay: number): Observable<T>;`

##### scan

**Signature**: `scan<R>(fn: (acc: R, value: T) => R, seed: R): Observable<R>;`

##### take

**Signature**: `take(count: number): Observable<T>;`

##### takeUntil

**Signature**: `takeUntil<U>(notifier: Observable<U>): Observable<T>;`

##### combineWith

**Signature**: `combineWith<U, R>(other: Observable<U>, combiner: (a: T, b: U) => R): Observable<R>;`

##### merge

**Signature**: `merge(other: Observable<T>): Observable<T>;`

##### switchMap

**Signature**: `switchMap<R>(fn: (value: T) => Observable<R>): Observable<R>;`

##### share

**Signature**: `share(): Observable<T>;`

### Functions

#### from

**Signature**: `export function from<T>(values: T[]): Observable<T>`

#### interval

**Signature**: `export function interval(delay: number): Observable<number>`

#### timer

**Signature**: `export function timer(delay: number): Observable<number>`

#### merge

**Signature**: `export function merge<T>(...observables: Observable<T>[]): Observable<T>`

#### combineLatest

**Signature**: `export function combineLatest<T, U, R>(
  obsA: Observable<T>,
  obsB: Observable<U>,
  combiner: (a: T, b: U) => R
): Observable<R>`


