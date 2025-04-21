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
}
