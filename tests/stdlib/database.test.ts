import { Database, QueryBuilder } from "../../src/stdlib/database";
import { describe, expect, test, beforeEach } from "@jest/globals";

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

describe("Database ORM", () => {
  beforeEach(() => {
    Database.clear();
  });

  test("QueryBuilder can be created", () => {
    const query = Database.query(User);
    expect(query).toBeInstanceOf(QueryBuilder);
  });

  test("QueryBuilder supports method chaining", () => {
    const query = Database.query(User)
      .where((u: User) => u.name === "John")
      .orderBy("name", "asc")
      .take(10);

    expect(query).toBeInstanceOf(QueryBuilder);
  });

  test("QueryBuilder can generate SQL", () => {
    const query = Database.query(User)
      .where((u: User) => u.name === "John")
      .orderBy("name", "asc")
      .take(10);

    const sql = query.toSQL();
    expect(sql.query).toContain("SELECT * FROM user");
    expect(sql.query).toContain("ORDER BY name ASC");
    expect(sql.query).toContain("LIMIT 10");
  });

  test("Database.save works with entities", async () => {
    const user = new User();
    user.name = "Test User";
    user.email = "test@example.com";

    const savedUser = await Database.save(user);
    expect(savedUser).toBe(user);
  });

  test("Database.find works with entity classes", async () => {
    const user = await Database.find(User, 1);
    // Should return null since we don't have a real database connection
    expect(user).toBeNull();
  });
});

describe("Database Configuration and Real Database Support", () => {
  afterEach(() => {
    Database.clear();
  });

  describe("Database Configuration", () => {
    it("should initialize with memory mode by default", () => {
      const db = Database.getInstance();
      expect(db).toBeDefined();
    });

    it("should configure database with memory type", () => {
      Database.configure({ type: "memory" });
      const db = Database.getInstance();
      expect(db).toBeDefined();
    });

    it("should throw error for postgres without required config", () => {
      expect(() => {
        Database.configure({ type: "postgres" });
      }).toThrow("PostgreSQL requires host and database in configuration");
    });

    it("should accept valid postgres configuration", () => {
      expect(() => {
        Database.configure({
          type: "postgres",
          host: "localhost",
          port: 5432,
          database: "testdb",
          user: "testuser",
          password: "testpass",
          max: 10,
          min: 2
        });
      }).not.toThrow();
    });

    it("should accept valid sqlite configuration", () => {
      expect(() => {
        Database.configure({
          type: "sqlite",
          filename: ":memory:"
        });
      }).not.toThrow();
    });

    it("should use default sqlite filename if not provided", () => {
      expect(() => {
        Database.configure({ type: "sqlite" });
      }).not.toThrow();
    });

    it("should use default port for postgres if not provided", () => {
      expect(() => {
        Database.configure({
          type: "postgres",
          host: "localhost",
          database: "testdb"
        });
      }).not.toThrow();
    });
  });

  describe("Database Query Execution", () => {
    beforeEach(() => {
      Database.configure({ type: "memory" });
    });

    it("should throw error when executing SQL in memory mode", async () => {
      const db = Database.getInstance();
      await expect(db.executeQuery("SELECT * FROM users")).rejects.toThrow(
        "Memory mode does not support SQL queries"
      );
    });

    it("should handle executeQuery with parameters", async () => {
      Database.configure({ type: "memory" });
      const db = Database.getInstance();
      await expect(
        db.executeQuery("SELECT * FROM users WHERE id = $1", [1])
      ).rejects.toThrow();
    });
  });

  describe("Database Save with Memory Mode", () => {
    beforeEach(() => {
      Database.configure({ type: "memory" });
      Database.clear();
    });

    it("should save entity to memory storage", async () => {
      const user = new User();
      user.name = "Alice";
      user.email = "alice@example.com";

      const savedUser = await Database.save(user);
      expect(savedUser).toBe(user);
      expect(savedUser.id).toBeDefined();
      expect(savedUser.createdAt).toBeDefined();
    });

    it("should generate sequential IDs for new entities", async () => {
      const user1 = new User();
      user1.name = "User 1";
      user1.email = "user1@example.com";

      const user2 = new User();
      user2.name = "User 2";
      user2.email = "user2@example.com";

      const saved1 = await Database.save(user1);
      const saved2 = await Database.save(user2);

      expect(saved1.id).toBe(1);
      expect(saved2.id).toBe(2);
    });

    it("should update existing entity in memory", async () => {
      const user = new User();
      user.name = "Original Name";
      user.email = "original@example.com";

      const saved = await Database.save(user);
      const originalId = saved.id;

      saved.name = "Updated Name";
      const updated = await Database.save(saved);

      expect(updated.id).toBe(originalId);
      expect(updated.name).toBe("Updated Name");
    });

    it("should maintain createdAt timestamp on updates", async () => {
      const user = new User();
      user.name = "Test User";
      user.email = "test@example.com";

      const saved = await Database.save(user);
      const originalCreatedAt = saved.createdAt;

      saved.name = "Updated User";
      const updated = await Database.save(saved);

      expect(updated.createdAt).toEqual(originalCreatedAt);
    });
  });

  describe("Database Find Operations", () => {
    beforeEach(() => {
      Database.configure({ type: "memory" });
      Database.clear();
    });

    it("should find entity by id", async () => {
      const user = new User();
      user.name = "Findable User";
      user.email = "find@example.com";
      const saved = await Database.save(user);

      const found = await Database.find(User, saved.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(saved.id);
      expect(found?.name).toBe("Findable User");
    });

    it("should return null for non-existent id", async () => {
      const found = await Database.find(User, 9999);
      expect(found).toBeNull();
    });

    it("should find all entities of a type", async () => {
      const user1 = new User();
      user1.name = "User 1";
      user1.email = "user1@example.com";

      const user2 = new User();
      user2.name = "User 2";
      user2.email = "user2@example.com";

      await Database.save(user1);
      await Database.save(user2);

      const allUsers = await Database.findAll(User);
      expect(allUsers).toHaveLength(2);
      expect(allUsers.map(u => u.name)).toContain("User 1");
      expect(allUsers.map(u => u.name)).toContain("User 2");
    });

    it("should return empty array when no entities exist", async () => {
      const allUsers = await Database.findAll(User);
      expect(allUsers).toEqual([]);
    });
  });

  describe("Database Delete Operations", () => {
    beforeEach(() => {
      Database.configure({ type: "memory" });
      Database.clear();
    });

    it("should delete entity by reference", async () => {
      const user = new User();
      user.name = "Deletable User";
      user.email = "delete@example.com";
      const saved = await Database.save(user);

      await Database.delete(saved);

      const found = await Database.find(User, saved.id);
      expect(found).toBeNull();
    });

    it("should handle deleting non-existent entity", async () => {
      const user = new User();
      user.id = 9999;
      user.name = "Non-existent";
      user.email = "none@example.com";

      // Should not throw
      await expect(Database.delete(user)).resolves.not.toThrow();
    });

    it("should remove entity from findAll results", async () => {
      const user1 = new User();
      user1.name = "Keep";
      user1.email = "keep@example.com";

      const user2 = new User();
      user2.name = "Delete";
      user2.email = "delete@example.com";

      const saved1 = await Database.save(user1);
      const saved2 = await Database.save(user2);

      await Database.delete(saved2);

      const allUsers = await Database.findAll(User);
      expect(allUsers).toHaveLength(1);
      expect(allUsers[0].name).toBe("Keep");
    });
  });

  describe("Database Clear and Mock Data Management", () => {
    it("should clear all mock data", async () => {
      Database.configure({ type: "memory" });

      const user = new User();
      user.name = "Test";
      user.email = "test@example.com";
      await Database.save(user);

      const post = new Post();
      post.title = "Test Post";
      post.content = "Content";
      await Database.save(post);

      Database.clear();

      const users = await Database.findAll(User);
      const posts = await Database.findAll(Post);

      expect(users).toEqual([]);
      expect(posts).toEqual([]);
    });

    it("should allow setting mock data manually", () => {
      Database.configure({ type: "memory" });
      Database.clear();

      const user1 = new User();
      user1.id = 1;
      user1.name = "Mock User 1";
      user1.email = "mock1@example.com";

      const user2 = new User();
      user2.id = 2;
      user2.name = "Mock User 2";
      user2.email = "mock2@example.com";

      Database.setMockData(User, [user1, user2]);

      const allUsers = Database.findAll(User);
      expect(allUsers).toHaveLength(2);
    });
  });

  describe("Database Lifecycle", () => {
    it("should close database connections", async () => {
      Database.configure({ type: "memory" });
      const db = Database.getInstance();
      await expect(db.close()).resolves.not.toThrow();
    });

    it("should shutdown database singleton", async () => {
      Database.configure({ type: "memory" });
      await expect(Database.shutdown()).resolves.not.toThrow();
    });
  });

  describe("Entity Validation", () => {
    it("should throw error for entity without constructor name", async () => {
      const invalidEntity = Object.create(null);
      await expect(Database.save(invalidEntity)).rejects.toThrow(
        "Invalid entity: no constructor name"
      );
    });

    it("should throw error for null entity", async () => {
      await expect(Database.save(null as any)).rejects.toThrow();
    });

    it("should throw error for undefined entity", async () => {
      await expect(Database.save(undefined as any)).rejects.toThrow();
    });
  });
});