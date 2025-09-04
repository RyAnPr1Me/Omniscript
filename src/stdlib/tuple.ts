/**
 * Tuple implementation for Omniscript
 * Provides immutable, typed tuples with pattern matching support
 */

// Tuple type definitions for type checking
export type Tuple<T extends readonly unknown[]> = Readonly<T>;
export type TupleElement<T, Index extends number> = T extends readonly [...infer _, infer Rest] 
  ? Index extends T['length'] 
    ? Rest 
    : never 
  : never;

export interface TuplePattern<T extends readonly unknown[]> {
  type: 'tuple';
  elements: readonly unknown[];
  size: number;
}

/**
 * Core Tuple class providing immutable tuple operations
 */
export class OmniTuple<T extends readonly unknown[]> {
  private readonly _elements: readonly unknown[];
  private readonly _size: number;

  constructor(...elements: T) {
    this._elements = Object.freeze([...elements]);
    this._size = elements.length;
  }

  /**
   * Get element at index
   */
  get<Index extends number>(index: Index): T[Index] {
    if (index < 0 || index >= this._size) {
      throw new Error(`Tuple index ${index} out of bounds [0, ${this._size})`);
    }
    return this._elements[index] as T[Index];
  }

  /**
   * Get tuple size
   */
  get size(): number {
    return this._size;
  }

  /**
   * Get all elements as readonly array
   */
  get elements(): readonly unknown[] {
    return this._elements;
  }

  /**
   * Convert to array (creates a copy)
   */
  toArray(): unknown[] {
    return [...this._elements];
  }

  /**
   * Check if tuple contains a value
   */
  contains(value: unknown): boolean {
    return this._elements.includes(value);
  }

  /**
   * Create new tuple with element replaced at index
   */
  with<Index extends number, U>(index: Index, value: U): OmniTuple<
    T extends readonly [...infer Before, unknown, ...infer After]
      ? Index extends Before['length']
        ? readonly [...Before, U, ...After]
        : T
      : T
  > {
    if (index < 0 || index >= this._size) {
      throw new Error(`Tuple index ${index} out of bounds [0, ${this._size})`);
    }
    
    const newElements = [...this._elements];
    newElements[index] = value;
    return new OmniTuple(...newElements as any);
  }

  /**
   * Append element(s) to create new tuple
   */
  append<U extends readonly unknown[]>(...elements: U): OmniTuple<readonly unknown[]> {
    return new OmniTuple(...this._elements, ...elements);
  }

  /**
   * Prepend element(s) to create new tuple
   */
  prepend<U extends readonly unknown[]>(...elements: U): OmniTuple<readonly unknown[]> {
    return new OmniTuple(...elements, ...this._elements);
  }

  /**
   * Take first N elements
   */
  take<N extends number>(n: N): OmniTuple<readonly unknown[]> {
    if (n < 0) throw new Error('Take count cannot be negative');
    return new OmniTuple(...this._elements.slice(0, n));
  }

  /**
   * Drop first N elements
   */
  drop<N extends number>(n: N): OmniTuple<readonly unknown[]> {
    if (n < 0) throw new Error('Drop count cannot be negative');
    return new OmniTuple(...this._elements.slice(n));
  }

  /**
   * Reverse the tuple
   */
  reverse(): OmniTuple<readonly unknown[]> {
    return new OmniTuple(...[...this._elements].reverse());
  }

  /**
   * Map over tuple elements
   */
  map<U>(fn: (value: unknown, index: number) => U): OmniTuple<readonly U[]> {
    return new OmniTuple(...this._elements.map(fn));
  }

  /**
   * Fold/reduce the tuple
   */
  fold<U>(fn: (acc: U, value: unknown, index: number) => U, initial: U): U {
    return this._elements.reduce(fn, initial);
  }

  /**
   * Check tuple equality
   */
  equals(other: OmniTuple<readonly unknown[]>): boolean {
    if (this._size !== other._size) return false;
    return this._elements.every((elem, i) => elem === other._elements[i]);
  }

  /**
   * Deep equality check
   */
  deepEquals(other: OmniTuple<readonly unknown[]>): boolean {
    if (this._size !== other._size) return false;
    return this._elements.every((elem, i) => {
      const otherElem = other._elements[i];
      if (elem === otherElem) return true;
      if (typeof elem === 'object' && typeof otherElem === 'object') {
        return JSON.stringify(elem) === JSON.stringify(otherElem);
      }
      return false;
    });
  }

  /**
   * String representation
   */
  toString(): string {
    return `(${this._elements.map(e => typeof e === 'string' ? `"${e}"` : String(e)).join(', ')})`;
  }

  /**
   * JSON representation
   */
  toJSON(): readonly unknown[] {
    return this._elements;
  }

  /**
   * Iterator support
   */
  *[Symbol.iterator](): Iterator<unknown> {
    for (const element of this._elements) {
      yield element;
    }
  }

  /**
   * Pattern matching support
   */
  match<U>(patterns: {
    [K in keyof T]?: (value: T[K]) => U;
  } & { _: () => U }): U {
    for (let i = 0; i < this._size; i++) {
      const pattern = patterns[i as keyof T];
      if (pattern) {
        return pattern(this._elements[i] as T[typeof i]);
      }
    }
    return patterns._();
  }
}

/**
 * Tuple utility functions
 */
export class TupleUtils {
  /**
   * Create tuple from array
   */
  static from<T extends readonly unknown[]>(array: T): OmniTuple<T> {
    return new OmniTuple(...array);
  }

  /**
   * Create empty tuple
   */
  static empty(): OmniTuple<readonly []> {
    return new OmniTuple();
  }

  /**
   * Create singleton tuple
   */
  static single<T>(value: T): OmniTuple<readonly [T]> {
    return new OmniTuple(value);
  }

  /**
   * Create pair tuple
   */
  static pair<T, U>(first: T, second: U): OmniTuple<readonly [T, U]> {
    return new OmniTuple(first, second);
  }

  /**
   * Create triple tuple
   */
  static triple<T, U, V>(first: T, second: U, third: V): OmniTuple<readonly [T, U, V]> {
    return new OmniTuple(first, second, third);
  }

  /**
   * Zip multiple arrays into tuple of tuples
   */
  static zip<T extends readonly unknown[][]>(...arrays: T): OmniTuple<
    readonly OmniTuple<{ [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never }>[]
  > {
    if (arrays.length === 0) return new OmniTuple();
    
    const minLength = Math.min(...arrays.map(arr => arr.length));
    const result: OmniTuple<any>[] = [];
    
    for (let i = 0; i < minLength; i++) {
      const elements = arrays.map(arr => arr[i]);
      result.push(new OmniTuple(...elements));
    }
    
    return new OmniTuple(...result);
  }

  /**
   * Unzip tuple of tuples into separate arrays
   */
  static unzip<T extends readonly OmniTuple<readonly unknown[]>[]>(
    tuples: OmniTuple<T>
  ): readonly unknown[][] {
    if (tuples.size === 0) return [];
    
    const firstTuple = tuples.get(0);
    const result: unknown[][] = Array.from({ length: firstTuple.size }, () => []);
    
    for (let i = 0; i < tuples.size; i++) {
      const tuple = tuples.get(i);
      for (let j = 0; j < tuple.size; j++) {
        result[j].push(tuple.get(j));
      }
    }
    
    return result;
  }

  /**
   * Create range tuple
   */
  static range(start: number, end: number, step: number = 1): OmniTuple<readonly number[]> {
    const elements: number[] = [];
    for (let i = start; i < end; i += step) {
      elements.push(i);
    }
    return new OmniTuple(...elements);
  }

  /**
   * Repeat value N times
   */
  static repeat<T>(value: T, count: number): OmniTuple<readonly T[]> {
    if (count < 0) throw new Error('Repeat count cannot be negative');
    return new OmniTuple(...Array(count).fill(value));
  }

  /**
   * Flatten nested tuples
   */
  static flatten<T>(tuple: OmniTuple<readonly (T | OmniTuple<readonly T[]>)[]>): OmniTuple<readonly T[]> {
    const result: T[] = [];
    
    for (let i = 0; i < tuple.size; i++) {
      const element = tuple.get(i);
      if (element instanceof OmniTuple) {
        result.push(...element.toArray() as T[]);
      } else {
        result.push(element as T);
      }
    }
    
    return new OmniTuple(...result);
  }

  /**
   * Group elements by key function
   */
  static groupBy<T, K>(
    tuple: OmniTuple<readonly T[]>, 
    keyFn: (value: T) => K
  ): Map<K, OmniTuple<readonly T[]>> {
    const groups = new Map<K, T[]>();
    
    for (let i = 0; i < tuple.size; i++) {
      const element = tuple.get(i);
      const key = keyFn(element);
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(element);
    }
    
    const result = new Map<K, OmniTuple<readonly T[]>>();
    for (const [key, values] of groups) {
      result.set(key, new OmniTuple(...values));
    }
    
    return result;
  }

  /**
   * Sort tuple elements
   */
  static sort<T>(
    tuple: OmniTuple<readonly T[]>, 
    compareFn?: (a: unknown, b: unknown) => number
  ): OmniTuple<readonly unknown[]> {
    const sorted = [...tuple.toArray()].sort(compareFn);
    return new OmniTuple(...sorted);
  }

  /**
   * Check if tuple matches pattern
   */
  static matches<T extends readonly unknown[]>(
    tuple: OmniTuple<T>, 
    pattern: TuplePattern<T>
  ): boolean {
    if (tuple.size !== pattern.size) return false;
    
    return pattern.elements.every((patternElement, index) => {
      const tupleElement = tuple.get(index);
      if (patternElement === '_') return true; // Wildcard
      return tupleElement === patternElement;
    });
  }

  /**
   * Cartesian product of tuples
   */
  static cartesianProduct<T extends readonly OmniTuple<readonly unknown[]>[]>(
    ...tuples: T
  ): OmniTuple<readonly OmniTuple<readonly unknown[]>[]> {
    if (tuples.length === 0) return new OmniTuple();
    if (tuples.length === 1) {
      return new OmniTuple(...tuples[0].toArray().map(x => new OmniTuple(x)));
    }
    
    const [first, ...rest] = tuples;
    const restProduct = TupleUtils.cartesianProduct(...rest);
    const result: OmniTuple<readonly unknown[]>[] = [];
    
    for (let i = 0; i < first.size; i++) {
      const firstElement = first.get(i);
      for (let j = 0; j < restProduct.size; j++) {
        const restElement = restProduct.get(j);
        result.push(new OmniTuple(firstElement, ...restElement.toArray()));
      }
    }
    
    return new OmniTuple(...result);
  }
}

// Export convenience functions
export const tuple = <T extends readonly unknown[]>(...elements: T): OmniTuple<T> => 
  new OmniTuple(...elements);

export const pair = <T, U>(first: T, second: U): OmniTuple<readonly [T, U]> => 
  TupleUtils.pair(first, second);

export const triple = <T, U, V>(first: T, second: U, third: V): OmniTuple<readonly [T, U, V]> => 
  TupleUtils.triple(first, second, third);

// Export with alias to avoid conflicts
export default OmniTuple;