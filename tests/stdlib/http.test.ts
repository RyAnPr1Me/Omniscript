import { HTTPServer } from '../../src/stdlib/http';
import { describe, expect, test, afterEach } from '@jest/globals';

describe('HTTP Server', () => {
  let server: HTTPServer | null = null;

  afterEach(async () => {
    if (server) {
      await server.close();
      server = null;
    }
  });

  test('HTTP Server can be created and configured', () => {
    server = new HTTPServer();
    expect(server).toBeDefined();
  });

  test('Server can register routes', () => {
    server = new HTTPServer();
    
    // These should not throw errors
    server.get('/', (req: any, res: any) => {
      res.send('Hello World');
    });
    
    server.post('/api/users', (req: any, res: any) => {
      res.json({ id: 1, name: 'Test User' });
    });
    
    expect(server).toBeDefined();
  });

  test('Server can use middleware', () => {
    server = new HTTPServer();
    
    server.use((req: any, res: any, next: any) => {
      res.setHeader('X-Custom-Header', 'test');
      next();
    });
    
    server.get('/', (req: any, res: any) => {
      res.send('Hello');
    });
    
    expect(server).toBeDefined();
  });
});