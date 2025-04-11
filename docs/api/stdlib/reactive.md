# Reactive Programming API Reference

## Core Types

### Stream<T>
A push-based stream of values that supports multiple subscribers.

```typescript
class Stream<T> {
  // Subscribe to stream values
  subscribe(fn: (value: T) => void): () => void;

  // Push a new value to subscribers
  next(value: T): void;

  // Complete the stream
  complete(): void;
}
```

#### Example Usage
```typescript
const events = new Stream<MouseEvent>();
const unsubscribe = events.subscribe(event => {
  console.log(`Mouse clicked at: ${event.x}, ${event.y}`);
});

// Later: clean up subscription
unsubscribe();
```

### Signal<T>
A reactive value container that notifies subscribers on changes.

```typescript
class Signal<T> {
  constructor(initial: T);

  // Get current value
  get value(): T;

  // Set new value and notify subscribers
  set value(newVal: T);

  // Subscribe to value changes
  subscribe(fn: (newVal: T) => void): () => void;
}
```

#### Example Usage
```typescript
const counter = new Signal<number>(0);
counter.subscribe(value => {
  console.log(`Counter updated: ${value}`);
});

counter.value = 42; // Logs: Counter updated: 42
```

## Best Practices

### Memory Management
Clean up subscriptions to prevent memory leaks:

```typescript
class Component {
  private subscriptions: Array<() => void> = [];

  init() {
    // Store subscription cleanup function
    this.subscriptions.push(
      signal.subscribe(value => this.update(value))
    );
  }

  destroy() {
    // Clean up all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }
}
```

### Error Handling
Handle errors in subscribers:

```typescript
stream.subscribe(value => {
  try {
    processValue(value);
  } catch (error) {
    console.error("Error processing value:", error);
  }
});
```

### Performance
Avoid unnecessary updates:

```typescript
const signal = new Signal<number>(0);
signal.subscribe(value => {
  // Only update UI when value actually changes
  if (value !== previousValue) {
    updateUI(value);
  }
});
```

### State Management Patterns

#### Derived Signals
Create computed values from signals:

```typescript
function derived<T, U>(signal: Signal<T>, fn: (value: T) => U): Signal<U> {
  const derived = new Signal<U>(fn(signal.value));
  signal.subscribe(value => {
    derived.value = fn(value);
  });
  return derived;
}

// Usage
const count = new Signal<number>(0);
const doubled = derived(count, n => n * 2);
```

#### Combining Signals
Combine multiple signals into one:

```typescript
function combine<T, U>(signals: Signal<T>[], fn: (...values: T[]) => U): Signal<U> {
  const initial = fn(...signals.map(s => s.value));
  const combined = new Signal<U>(initial);
  
  signals.forEach(signal => {
    signal.subscribe(() => {
      combined.value = fn(...signals.map(s => s.value));
    });
  });
  
  return combined;
}

// Usage
const firstName = new Signal<string>("John");
const lastName = new Signal<string>("Doe");
const fullName = combine(
  [firstName, lastName],
  (first, last) => `${first} ${last}`
);
```

### Testing
Test reactive components:

```typescript
describe('Signal', () => {
  test('notifies subscribers on value change', () => {
    const signal = new Signal<number>(0);
    const mockFn = jest.fn();
    
    signal.subscribe(mockFn);
    signal.value = 42;
    
    expect(mockFn).toHaveBeenCalledWith(42);
  });
});
```

## See Also
- [Memory Management](../runtime/memory.md)
- [Performance Guide](../performance.md)
- [State Management](../state/README.md)