import { Database, QueryBuilder } from '../../src/stdlib/database';
import { describe, expect, test, beforeEach } from '@jest/globals';

// Test entity classes (without decorators for now to avoid TypeScript issues)
class User {
  id!: number;
  name!: string;
  email!: string;
  createdAt!: Date;
  posts!: Post[];
}

class Post {
  id!: number;
  title!: string;
  content!: string;
  user!: User;
}

describe('Database ORM', () => {
  beforeEach(() => {
    Database.clear();
  });

  test('QueryBuilder can be created', () => {
    const query = Database.query(User);
    expect(query).toBeInstanceOf(QueryBuilder);
  });

  test('QueryBuilder supports method chaining', () => {
    const query = Database.query(User)
      .where((u: User) => u.name === 'John')
      .orderBy('name', 'asc')
      .take(10);
    
    expect(query).toBeInstanceOf(QueryBuilder);
  });

  test('QueryBuilder can generate SQL', () => {
    const query = Database.query(User)
      .where((u: User) => u.name === 'John')
      .orderBy('name', 'asc')
      .take(10);
    
    const sql = query.toSQL();
    expect(sql.query).toContain('SELECT * FROM user');
    expect(sql.query).toContain('ORDER BY name ASC');
    expect(sql.query).toContain('LIMIT 10');
  });

  test('Database.save works with entities', async () => {
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@example.com';
    
    const savedUser = await Database.save(user);
    expect(savedUser).toBe(user);
  });

  test('Database.find works with entity classes', async () => {
    const user = await Database.find(User, 1);
    // Should return null since we don't have a real database connection
    expect(user).toBeNull();
  });
});