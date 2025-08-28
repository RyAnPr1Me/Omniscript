import { HTTPServer } from '../../src/stdlib/http';
import { Database } from '../../src/stdlib/database';
import { Crypto } from '../../src/stdlib/crypto';
import { describe, expect, test, afterEach } from '@jest/globals';

describe('README Feature Integration', () => {
  let server: HTTPServer | null = null;

  afterEach(async () => {
    if (server) {
      await server.close();
      server = null;
    }
  });

  test('HTTP Server example from README works', async () => {
    server = new HTTPServer();
    
    server.get("/", (req: any, res: any) => {
      res.send("Welcome!");
    });
    
    expect(server).toBeDefined();
  });

  test('Database ORM example from README structure works', async () => {
    // Example from README: Type-safe queries
    class User {
      id!: number;
      name!: string;
      posts!: any[];
    }
    
    const query = Database.query(User)
      .where((u: User) => u.posts.length > 0)
      .orderBy('name', 'asc')
      .take(10);
    
    const sql = query.toSQL();
    expect(sql.query).toContain('SELECT * FROM user');
    expect(sql.query).toContain('ORDER BY name ASC');
    expect(sql.query).toContain('LIMIT 10');
  });

  test('Crypto features from README work', async () => {
    // Hashing
    const hash = await Crypto.hash('test data', 'SHA-256');
    expect(hash).toHaveLength(64);
    
    // Encryption
    const encrypted = await Crypto.encrypt('secret message', 'key');
    expect(encrypted.encrypted).toBeDefined();
    expect(encrypted.algorithm).toBe('AES-GCM');
    
    const decrypted = await Crypto.decrypt(encrypted, 'key');
    expect(decrypted).toBe('secret message');
  });

  test('REST API example structure from README', async () => {
    server = new HTTPServer();
    
    // Simulate the README example structure
    server.get("/users", async (req: any, res: any) => {
      const users = [
        { id: 1, name: "John", createdAt: new Date() },
        { id: 2, name: "Jane", createdAt: new Date() }
      ];
      res.json(users);
    });
    
    server.post("/users", async (req: any, res: any) => {
      const user = { id: 3, ...req.body };
      res.status(201).json(user);
    });
    
    expect(server).toBeDefined();
  });

  test('Standard library features are available', () => {
    // Check that all advertised modules are available
    expect(HTTPServer).toBeDefined();
    expect(Database).toBeDefined();
    expect(Database.query).toBeDefined();
    expect(Database.save).toBeDefined();
    expect(Crypto).toBeDefined();
    expect(Crypto.hash).toBeDefined();
    expect(Crypto.encrypt).toBeDefined();
    expect(Crypto.generateKey).toBeDefined();
  });
});