# Omniscript Best Practices

## Project Structure
```
myapp/
├── src/
│   ├── components/    # UI components
│   ├── models/       # Data models
│   ├── services/     # Business logic
│   └── utils/        # Helper functions
├── tests/           # Test files
├── package.json     # Dependencies
└── omni.json       # Omniscript config
```

## Coding Guidelines

### Type Safety
- Use type inference when possible
- Define clear interfaces
- Avoid `any` type
- Use generics for reusable code

### Error Handling
- Use pattern matching for error cases
- Implement proper try/catch blocks
- Provide meaningful error messages
- Handle edge cases explicitly

### Performance
- Use async/await for I/O operations
- Implement proper memory management
- Follow garbage collection best practices
- Profile and optimize hot paths

### Testing
- Write unit tests for all features
- Include integration tests
- Test edge cases
- Maintain high test coverage

### Reactive Programming
- Use `Signal` for state management in UI components.
- Prefer `Stream` for event-driven programming.

### Memory Management
- Enable garbage collection in long-running applications.
- Use `detectCircularReferences` to avoid memory leaks.

### Concurrency
- Use the actor model for isolated state and message passing.
- Avoid shared mutable state to prevent race conditions.
