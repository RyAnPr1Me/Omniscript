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

  async pop(): Promise<T | undefined> {
    await this.lock.acquire();
    try {
      return this.items.pop();
    } finally {
      this.lock.release();
    }
  }
}

export class Map<K, V> {
  private items = new Map<K, V>();
  private lock = new Mutex();

  async set(key: K, value: V): Promise<void> {
    await this.lock.acquire();
    try {
      this.items.set(key, value);
    } finally {
      this.lock.release();
    }
  }

  async get(key: K): Promise<V | undefined> {
    await this.lock.acquire();
    try {
      return this.items.get(key);
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
