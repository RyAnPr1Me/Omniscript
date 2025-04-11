# Collections API Reference

## List<T>
A thread-safe dynamic array implementation with type safety and built-in concurrency support.

### Methods
```typescript
class List<T> {
  // Add item to end of list, thread-safe
  async push(item: T): Promise<void>;
  
  // Remove and return last item, thread-safe
  async pop(): Promise<T | undefined>;
  
  // Filter items matching predicate, returns new List
  async filter(predicate: (item: T) => boolean): Promise<List<T>>;
}
```

### Examples
```typescript
const numbers = new List<number>();
await numbers.push(1);
await numbers.push(2);

// Thread-safe filtering
const evenNumbers = await numbers.filter(n => n % 2 === 0);
```

### Thread Safety
List operations are protected by a mutex to ensure thread-safety in concurrent environments:

```typescript
const list = new List<number>();

// Safe for concurrent access
Promise.all([
  list.push(1),
  list.push(2),
  list.pop()
]);
```

## Map<K,V>
A thread-safe key-value store with type-safe keys and values.

### Methods
```typescript
class Map<K,V> {
  // Set value for key, thread-safe
  async set(key: K, value: V): Promise<void>;
  
  // Get value for key, thread-safe
  async get(key: K): Promise<V | undefined>;
}
```

### Examples
```typescript
interface User {
  id: number;
  name: string;
}

const users = new Map<string, User>();
await users.set("admin", { id: 1, name: "Admin" });
const admin = await users.get("admin");
```

### Thread Safety
Map operations use a mutex to ensure thread-safety:

```typescript
const cache = new Map<string, number>();

// Safe for concurrent operations
Promise.all([
  cache.set("a", 1),
  cache.set("b", 2),
  cache.get("a")
]);
```

## Best Practices

### Memory Management
Collections automatically participate in the runtime's garbage collection:

```typescript
const list = new List<Resource>();
await list.push(new Resource());
// Resources are automatically cleaned up when no longer referenced
```

### Concurrent Access
Use the async methods to ensure thread-safe access:

```typescript
// DO:
await list.push(item);

// DON'T:
list.items.push(item); // Direct array access
```

### Error Handling
Collections use the Result type for error handling:

```typescript
try {
  await list.pop();
} catch (e) {
  console.error("Operation failed:", e);
}
```
