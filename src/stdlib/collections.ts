export class List<T> {
  private items: T[] = [];
  
  push(item: T): void {
    this.items.push(item);
  }
  
  pop(): T | undefined {
    return this.items.pop();
  }
}

export class Map<K, V> {
  private items = new Map<K, V>();
  
  set(key: K, value: V): void {
    this.items.set(key, value);
  }
  
  get(key: K): V | undefined {
    return this.items.get(key);
  }
}
