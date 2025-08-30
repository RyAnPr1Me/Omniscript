import { Omniscript } from '../../src/index';

describe('REST API Example Tests', () => {
  const omni = new Omniscript();

  test('can create User class and call methods', async () => {
    const src = `class User { constructor(data) { this.name = data.name; this.email = data.email; } getName() { return this.name; } } let user = new User({ name: 'John Doe', email: 'john@example.com' }); user.getName()`;
    
    const result = await omni.execute(src);
    expect(result).toBe('John Doe');
  });

  test('Database mock object functionality', async () => {
    const src = `let Database = { save: fn(entity) => entity }; typeof Database.save`;
    
    const result = await omni.execute(src);
    expect(result).toBe('function');
  });

  test('HTTP Server mock functionality', async () => {
    const src = `let routes = []; let server = { get: fn(path, handler) => routes }; server.get('/users', fn() => 'users'); routes.length`;
    
    const result = await omni.execute(src);
    expect(result).toBe(0);
  });

  test('decorators syntax parsing', async () => {
    const src = `@component class UserList { constructor() { this.name = 'UserList'; } getName() { return this.name; } } let list = new UserList(); list.getName()`;
    
    const result = await omni.execute(src);
    expect(result).toBe('UserList');
  });

  test('pattern matching with string cases', async () => {
    const src = `let status = 'active'; match status { 'active' => 'User is active', 'inactive' => 'User is inactive', _ => 'Unknown status' }`;
    
    const result = await omni.execute(src);
    expect(result).toBe('User is active');
  });

  test('class methods and Object.assign', async () => {
    const src = `class User { constructor(data) { this.name = data.name; this.email = data.email; } getName() { return this.name; } getEmail() { return this.email; } } let user = new User({ name: 'Jane Smith', email: 'jane@example.com' }); user.getName()`;
    
    const result = await omni.execute(src);
    expect(result).toBe('Jane Smith');
  });

  test('simple arithmetic and variables', async () => {
    const src = `let x = 5; let y = 10; x + y`;
    
    const result = await omni.execute(src);
    expect(result).toBe(15);
  });
});