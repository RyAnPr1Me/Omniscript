# Collections API Reference

## List<T>
A dynamic array implementation with type safety.

### Methods
- `push(item: T): void` - Add item to end
- `pop(): T | undefined` - Remove and return last item
- `get(index: number): T` - Get item at index
- `size(): number` - Get list length

## Map<K,V>
Key-value store with type-safe keys and values.

### Methods
- `set(key: K, value: V): void`
- `get(key: K): V | undefined`
- `has(key: K): boolean`
- `delete(key: K): boolean`

## Examples
```typescript
let numbers = new List<number>();
numbers.push(1);
numbers.push(2);

let users = new Map<string, User>();
users.set("admin", adminUser);
```
