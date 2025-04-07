# Omniscript Examples

## Basic Examples

### Hello World
```typescript
fn main() {
  Console.log("Hello, Omniscript!");
}
```

### Web Server
```typescript
import { HTTP } from 'stdlib/network';

const app = new HTTP.Server();

app.get("/", (req, res) => {
  res.send("Welcome!");
});

app.listen(3000);
```

### Database Operations
```typescript
import { Database } from 'stdlib/database';

interface User {
  id: number;
  name: string;
}

async fn getUsers(): Promise<User[]> {
  return await Database.query<User>()
    .where(u => u.active)
    .orderBy(u => u.name)
    .take(10);
}
```

## Advanced Examples
- [Todo App](./todo-app.md)
- [Chat Application](./chat-app.md)
- [REST API Server](./rest-api.md)
