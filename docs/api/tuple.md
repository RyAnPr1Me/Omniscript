# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [tuple](#tuple)

## tuple

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/tuple.ts`

### Classes

#### OmniTuple

Core Tuple class providing immutable tuple operations

**Properties**:

- `_elements: readonly unknown[]` - 
- `_size: number` - 

**Methods**:

##### get

Get element at index

**Signature**: `get<Index extends number>(index: Index): T[Index]`

##### toArray

Convert to array (creates a copy)

**Signature**: `toArray(): unknown[]`

##### contains

Check if tuple contains a value

**Signature**: `contains(value: unknown): boolean`

##### with

Create new tuple with element replaced at index

**Signature**: `with<Index extends number, U>(index: Index, value: U): OmniTuple<
    T extends readonly [...infer Before, unknown, ...infer After]
      ? Index extends Before['length']
        ? readonly [...Before, U, ...After]
        : T
      : T
  >`

##### append

Append element(s) to create new tuple

**Signature**: `append<U extends readonly unknown[]>(...elements: U): OmniTuple<readonly unknown[]>`

##### prepend

Prepend element(s) to create new tuple

**Signature**: `prepend<U extends readonly unknown[]>(...elements: U): OmniTuple<readonly unknown[]>`

##### take

Take first N elements

**Signature**: `take<N extends number>(n: N): OmniTuple<readonly unknown[]>`

##### drop

Drop first N elements

**Signature**: `drop<N extends number>(n: N): OmniTuple<readonly unknown[]>`

##### reverse

Reverse the tuple

**Signature**: `reverse(): OmniTuple<readonly unknown[]>`

##### map

Map over tuple elements

**Signature**: `map<U>(fn: (value: unknown, index: number) => U): OmniTuple<readonly U[]>`

##### fold

Fold/reduce the tuple

**Signature**: `fold<U>(fn: (acc: U, value: unknown, index: number) => U, initial: U): U`

##### equals

Check tuple equality

**Signature**: `equals(other: OmniTuple<readonly unknown[]>): boolean`

##### deepEquals

Deep equality check

**Signature**: `deepEquals(other: OmniTuple<readonly unknown[]>): boolean`

##### toString

String representation

**Signature**: `toString(): string`

##### toJSON

JSON representation

**Signature**: `toJSON(): readonly unknown[]`

##### match

Pattern matching support

**Signature**: `match<U>(patterns:`

#### TupleUtils

Tuple utility functions

**Methods**:

##### from

Create tuple from array

**Signature**: `static from<T extends readonly unknown[]>(array: T): OmniTuple<T>`

##### empty

Create empty tuple

**Signature**: `static empty(): OmniTuple<readonly []>`

##### single

Create singleton tuple

**Signature**: `static single<T>(value: T): OmniTuple<readonly [T]>`

##### pair

Create pair tuple

**Signature**: `static pair<T, U>(first: T, second: U): OmniTuple<readonly [T, U]>`

##### triple

Create triple tuple

**Signature**: `static triple<T, U, V>(first: T, second: U, third: V): OmniTuple<readonly [T, U, V]>`

##### zip

Zip multiple arrays into tuple of tuples

**Signature**: `static zip<T extends readonly unknown[][]>(...arrays: T): OmniTuple<
    readonly OmniTuple<`

##### unzip

Unzip tuple of tuples into separate arrays

**Signature**: `static unzip<T extends readonly OmniTuple<readonly unknown[]>[]>(
    tuples: OmniTuple<T>
  ): readonly unknown[][]`

##### range

Create range tuple

**Signature**: `static range(start: number, end: number, step: number = 1): OmniTuple<readonly number[]>`

##### repeat

Repeat value N times

**Signature**: `static repeat<T>(value: T, count: number): OmniTuple<readonly T[]>`

##### flatten

Flatten nested tuples

**Signature**: `static flatten<T>(tuple: OmniTuple<readonly (T | OmniTuple<readonly T[]>)[]>): OmniTuple<readonly T[]>`

##### groupBy

Group elements by key function

**Signature**: `static groupBy<T, K>(
    tuple: OmniTuple<readonly T[]>, 
    keyFn: (value: T) => K
  ): Map<K, OmniTuple<readonly T[]>>`

##### sort

Sort tuple elements

**Signature**: `static sort<T>(
    tuple: OmniTuple<readonly T[]>, 
    compareFn?: (a: unknown, b: unknown) => number
  ): OmniTuple<readonly unknown[]>`

##### matches

Check if tuple matches pattern

**Signature**: `static matches<T extends readonly unknown[]>(
    tuple: OmniTuple<T>, 
    pattern: TuplePattern<T>
  ): boolean`

##### cartesianProduct

Cartesian product of tuples

**Signature**: `static cartesianProduct<T extends readonly OmniTuple<readonly unknown[]>[]>(
    ...tuples: T
  ): OmniTuple<readonly OmniTuple<readonly unknown[]>[]>`

### Interfaces

#### TuplePattern

**Properties**:

- `type: 'tuple'` - 
- `elements: readonly unknown[]` - 
- `size: number` - 


