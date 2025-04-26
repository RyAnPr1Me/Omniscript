import { Result } from '../runtime';

export class List<T> {
  private items: T[] = [];
  private lock = new Mutex();

  async push(item: T): Promise<void> {
    await this.lock.acquire();
    try {
      this.items.push(item);
    } finally {
      this.lock.release();
    }
  }

  async tryPush(item: T): Promise<Result<void, Error>> {
    try {
      await this.lock.acquire();
      this.items.push(item);
      return Result.Ok(void 0);
    } catch (error) {
      return Result.Err(error as Error);
    } finally {
      this.lock.release();
    }
  }

  pop(): T | undefined {
    // Synchronous pop for compatibility with tests
    return this.items.pop();
  }

  async filter(predicate: (item: T) => boolean): Promise<List<T>> {
    await this.lock.acquire();
    try {
      const filteredItems = this.items.filter(predicate);
      const newList = new List<T>();
      for (const item of filteredItems) {
        await newList.push(item);
      }
      return newList;
    } finally {
      this.lock.release();
    }
  }

  async toArray(): Promise<T[]> {
    await this.lock.acquire();
    try {
      return [...this.items];
    } finally {
      this.lock.release(); 
    }
  }
}

export class Map<K, V> {
  private _items = new globalThis.Map<K, V>();
  private lock = new Mutex();

  async set(key: K, value: V): Promise<void> {
    await this.lock.acquire();
    try {
      this._items.set(key, value);
    } finally {
      this.lock.release();
    }
  }

  async get(key: K): Promise<V | undefined> {
    await this.lock.acquire();
    try {
      return this._items.get(key);
    } finally {
      this.lock.release();
    }
  }

  async entries(): Promise<[K, V][]> {
    await this.lock.acquire();
    try {
      return Array.from(this._items.entries());
    } finally {
      this.lock.release();
    }
  }

  async clear(): Promise<void> {
    await this.lock.acquire();
    try {
      this._items.clear();
    } finally {
      this.lock.release();
    }
  }
}

class Mutex {
  private promise: Promise<void> = Promise.resolve();

  async acquire(): Promise<void> {
    let release: () => void;
    const next = new Promise<void>(resolve => (release = resolve));
    const previous = this.promise;
    this.promise = next;
    await previous;
    release!();
  }

  release(): void {
    // No-op, handled by acquire
  }

  // Add timeout support
  async acquireWithTimeout(timeoutMs: number): Promise<boolean> {
    const timeoutPromise = new Promise<false>(resolve => 
      setTimeout(() => resolve(false), timeoutMs)
    );
    const acquirePromise = this.acquire().then(() => true);
    return Promise.race([acquirePromise, timeoutPromise]);
  }
}
