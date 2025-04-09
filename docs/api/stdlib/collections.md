# Collections API Reference

## List<T>
A dynamic array implementation with type safety.

### Methods
- `push(item: T): void` - Add item to end
- `pop(): T | undefined` - Remove and return last item
- `get(index: number): T` - Get item at index
- `size(): number` - Get list length
- `filter(predicate: (item: T) => boolean): List<T>` - Returns a new list with items matching the predicate.

## Map<K,V>
Key-value store with type-safe keys and values.

### Methods
- `set(key: K, value: V): void`
- `get(key: K): V | undefined`
- `has(key: K): boolean`
- `delete(key: K): boolean`
- `keys(): K[]` - Returns an array of all keys.
- `values(): V[]` - Returns an array of all values.

## Examples
```typescript
let numbers = new List<number>();
numbers.push(1);
numbers.push(2);
const evenNumbers = await numbers.filter(n => n % 2 === 0);

let users = new Map<string, User>();
users.set("admin", adminUser);
console.log(users.keys()); // Logs: ["admin"]
```
