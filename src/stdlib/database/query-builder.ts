import { debug } from "../../debug";
import { getMetadata } from "./decorators";
import { Pool, PoolClient } from "pg";
import sqlite3 from "sqlite3";

export type DatabaseType = "postgres" | "sqlite" | "memory";

export interface DatabaseConfig {
  type: DatabaseType;
  // PostgreSQL config
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  // SQLite config
  filename?: string;
  // Connection pooling
  max?: number;
  min?: number;
}

export type WhereCondition<T> = (entity: T) => boolean;
export type OrderByField<T> = keyof T | ((entity: T) => any);
export type OrderDirection = "asc" | "desc";

export class QueryBuilder<T> {
  private entityClass: new () => T;
  private whereConditions: WhereCondition<T>[] = [];
  private orderByFields: Array<{
    field: OrderByField<T>;
    direction: OrderDirection;
  }> = [];
  private limitCount?: number;
  private skipCount?: number;
  private database: Database;

  constructor(entityClass: new () => T, database: Database) {
    this.entityClass = entityClass;
    this.database = database;
    debug.debug("Database", `QueryBuilder created for ${entityClass.name}`);
  }

  where(condition: WhereCondition<T>): QueryBuilder<T> {
    this.whereConditions.push(condition);
    debug.debug("Database", "WHERE condition added to query");
    return this;
  }

  orderBy(
    field: OrderByField<T>,
    direction: OrderDirection = "asc",
  ): QueryBuilder<T> {
    this.orderByFields.push({ field, direction });
    debug.debug(
      "Database",
      `ORDER BY ${String(field)} ${direction} added to query`,
    );
    return this;
  }

  take(count: number): QueryBuilder<T> {
    this.limitCount = count;
    debug.debug("Database", `LIMIT ${count} added to query`);
    return this;
  }

  skip(count: number): QueryBuilder<T> {
    this.skipCount = count;
    debug.debug("Database", `OFFSET ${count} added to query`);
    return this;
  }

  // Convert query to SQL (basic implementation)
  toSQL(): { query: string; params: any[] } {
    const metadata = getMetadata(this.entityClass);
    const tableName = this.entityClass.name.toLowerCase();

    let query = `SELECT * FROM ${tableName}`;
    const params: any[] = [];

    // Add WHERE clauses (simplified - in real implementation would need SQL generation)
    if (this.whereConditions.length > 0) {
      query += " WHERE 1=1"; // Placeholder for now
      debug.debug("Database", "WHERE conditions would be processed here");
    }

    // Add ORDER BY
    if (this.orderByFields.length > 0) {
      const orderClauses = this.orderByFields.map(({ field, direction }) => {
        const fieldName = typeof field === "string" ? field : "id"; // Simplified
        return `${fieldName} ${direction.toUpperCase()}`;
      });
      query += ` ORDER BY ${orderClauses.join(", ")}`;
    }

    // Add LIMIT
    if (this.limitCount !== undefined) {
      query += ` LIMIT ${this.limitCount}`;
    }

    // Add OFFSET
    if (this.skipCount !== undefined) {
      query += ` OFFSET ${this.skipCount}`;
    }

    debug.debug("Database", `Generated SQL: ${query}`);
    return { query, params };
  }

  // Execute query with actual filtering and sorting
  async execute(): Promise<T[]> {
    const { query } = this.toSQL();
    debug.info("Database", `Executing query: ${query}`);

    const tableName = this.entityClass.name.toLowerCase();
    let data = [...this.database.getMockData(tableName)] as T[];

    // Apply WHERE conditions
    for (const condition of this.whereConditions) {
      data = data.filter(condition);
    }

    // Apply ORDER BY
    for (const { field, direction } of this.orderByFields) {
      data.sort((a, b) => {
        let aVal, bVal;

        if (typeof field === "string") {
          aVal = (a as any)[field];
          bVal = (b as any)[field];
        } else if (typeof field === "function") {
          aVal = field(a);
          bVal = field(b);
        } else {
          aVal = (a as any).id;
          bVal = (b as any).id;
        }

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Apply SKIP/OFFSET
    if (this.skipCount) {
      data = data.slice(this.skipCount);
    }

    // Apply TAKE/LIMIT
    if (this.limitCount) {
      data = data.slice(0, this.limitCount);
    }

    return data;
  }

  // Alias methods for common patterns
  async first(): Promise<T | null> {
    const results = await this.take(1).execute();
    return results.length > 0 ? results[0] : null;
  }

  async count(): Promise<number> {
    // For count, we don't need to apply limit/skip, just where conditions
    const tableName = this.entityClass.name.toLowerCase();
    let data = [...this.database.getMockData(tableName)] as T[];

    // Apply WHERE conditions
    for (const condition of this.whereConditions) {
      data = data.filter(condition);
    }

    return data.length;
  }

  async exists(): Promise<boolean> {
    const count = await this.count();
    return count > 0;
  }

  // Additional convenience methods
  async findAll(): Promise<T[]> {
    return this.execute();
  }

  async findById(id: any): Promise<T | null> {
    return this.where((entity: T) => (entity as any).id === id).first();
  }

  // Aggregate functions
  async sum(field: keyof T): Promise<number> {
    const data = await this.execute();
    return data.reduce((sum, item) => sum + ((item as any)[field] || 0), 0);
  }

  async avg(field: keyof T): Promise<number> {
    const data = await this.execute();
    const sum = await this.sum(field);
    return data.length > 0 ? sum / data.length : 0;
  }

  async max(field: keyof T): Promise<any> {
    const data = await this.execute();
    return data.length > 0
      ? Math.max(...data.map((item) => (item as any)[field]))
      : null;
  }

  async min(field: keyof T): Promise<any> {
    const data = await this.execute();
    return data.length > 0
      ? Math.min(...data.map((item) => (item as any)[field]))
      : null;
  }
}

// Database utility class with real database support
export class Database {
  private static _instance: Database;
  private config: DatabaseConfig;
  private pgPool?: Pool;
  private sqliteDb?: sqlite3.Database;
  private mockData: Map<string, any[]> = new Map();

  private constructor(config?: DatabaseConfig) {
    this.config = config || { type: "memory" };
    if (this.config.type === "postgres") {
      this.initializePostgres();
    } else if (this.config.type === "sqlite") {
      this.initializeSQLite();
    }
  }

  private initializePostgres(): void {
    if (!this.config.host || !this.config.database) {
      throw new Error("PostgreSQL requires host and database in configuration");
    }
    this.pgPool = new Pool({
      host: this.config.host,
      port: this.config.port || 5432,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      max: this.config.max || 10,
      min: this.config.min || 2,
    });
    debug.info("Database", "PostgreSQL connection pool initialized");
  }

  private initializeSQLite(): void {
    const filename = this.config.filename || ":memory:";
    this.sqliteDb = new sqlite3.Database(filename, (err) => {
      if (err) {
        debug.error("Database", `SQLite initialization error: ${err.message}`);
        throw err;
      }
      debug.info("Database", `SQLite database opened: ${filename}`);
    });
  }

  static getInstance(config?: DatabaseConfig): Database {
    if (!Database._instance) {
      Database._instance = new Database(config);
    }
    return Database._instance;
  }

  static configure(config: DatabaseConfig): void {
    Database._instance = new Database(config);
  }

  async executeQuery(
    sql: string,
    params: any[] = [],
  ): Promise<{ rows: any[] }> {
    if (this.config.type === "postgres") {
      return await this.executePostgresQuery(sql, params);
    } else if (this.config.type === "sqlite") {
      return await this.executeSQLiteQuery(sql, params);
    } else {
      // Memory mode - use mock data
      throw new Error(
        "Memory mode does not support SQL queries. Use ORM methods instead.",
      );
    }
  }

  private async executePostgresQuery(
    sql: string,
    params: any[],
  ): Promise<{ rows: any[] }> {
    if (!this.pgPool) {
      throw new Error("PostgreSQL pool not initialized");
    }
    const client: PoolClient = await this.pgPool.connect();
    try {
      const result = await client.query(sql, params);
      return { rows: result.rows };
    } finally {
      client.release();
    }
  }

  private async executeSQLiteQuery(
    sql: string,
    params: any[],
  ): Promise<{ rows: any[] }> {
    if (!this.sqliteDb) {
      throw new Error("SQLite database not initialized");
    }
    return new Promise((resolve, reject) => {
      this.sqliteDb!.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows: rows || [] });
        }
      });
    });
  }

  static query<T>(entityClass: new () => T): QueryBuilder<T> {
    const instance = Database.getInstance();
    return new QueryBuilder(entityClass, instance);
  }

  static async save<T>(entity: T): Promise<T> {
    debug.info("Database", `Saving entity of type ${entity?.constructor.name}`);

    const instance = Database.getInstance();
    const tableName = entity?.constructor.name.toLowerCase();
    if (!tableName) throw new Error("Invalid entity: no constructor name");

    // Use in-memory storage for memory mode or if no real database configured
    if (instance.config.type === "memory") {
      return instance.saveToMemory(entity, tableName);
    }

    // For real databases, we would need proper ORM mapping
    // For now, fall back to memory mode
    debug.warn(
      "Database",
      "Real database save not fully implemented, using memory mode",
    );
    return instance.saveToMemory(entity, tableName);
  }

  private saveToMemory<T>(entity: T, tableName: string): T {
    const data = this.mockData.get(tableName) || [];
    const entityData = entity as any;

    if (entityData.id) {
      // Update existing entity
      const index = data.findIndex((item) => item.id === entityData.id);
      if (index >= 0) {
        Object.assign(data[index], entityData);
      }
    } else {
      // Create new entity - assign ID and timestamps to original object
      entityData.id =
        data.length > 0 ? Math.max(...data.map((item) => item.id)) + 1 : 1;
      if (!entityData.createdAt) {
        entityData.createdAt = new Date().toISOString();
      }
      data.push({ ...entityData });
      this.mockData.set(tableName, data);
    }

    return entity;
  }

  static async delete<T>(entity: T): Promise<void> {
    debug.info(
      "Database",
      `Deleting entity of type ${entity?.constructor.name}`,
    );

    const instance = Database.getInstance();
    const tableName = entity?.constructor.name.toLowerCase();
    if (!tableName) throw new Error("Invalid entity: no constructor name");

    if (instance.config.type === "memory") {
      const data = instance.mockData.get(tableName) || [];
      const entityData = entity as any;

      const index = data.findIndex((item) => item.id === entityData.id);
      if (index >= 0) {
        data.splice(index, 1);
        instance.mockData.set(tableName, data);
      }
    } else {
      debug.warn(
        "Database",
        "Real database delete not fully implemented, using memory mode",
      );
    }
  }

  static async find<T>(entityClass: new () => T, id: any): Promise<T | null> {
    debug.info("Database", `Finding ${entityClass.name} with id ${id}`);

    const instance = Database.getInstance();
    const tableName = entityClass.name.toLowerCase();
    if (!tableName) throw new Error("Invalid entity class: no name");

    if (instance.config.type === "memory") {
      const data = instance.mockData.get(tableName) || [];
      const found = data.find((item) => item.id === id);
      return found ? (found as T) : null;
    }

    // For real databases, fall back to memory for now
    debug.warn(
      "Database",
      "Real database find not fully implemented, using memory mode",
    );
    const data = instance.mockData.get(tableName) || [];
    const found = data.find((item) => item.id === id);
    return found ? (found as T) : null;
  }

  static async findAll<T>(entityClass: new () => T): Promise<T[]> {
    debug.info("Database", `Finding all ${entityClass.name} entities`);

    const instance = Database.getInstance();
    const tableName = entityClass.name.toLowerCase();
    if (!tableName) throw new Error("Invalid entity class: no name");

    if (instance.config.type === "memory") {
      const data = instance.mockData.get(tableName) || [];
      return data as T[];
    }

    // For real databases, fall back to memory for now
    debug.warn(
      "Database",
      "Real database findAll not fully implemented, using memory mode",
    );
    const data = instance.mockData.get(tableName) || [];
    return data as T[];
  }

  // Internal method used by QueryBuilder
  getMockData(tableName: string): any[] {
    return this.mockData.get(tableName) || [];
  }

  setMockData(tableName: string, data: any[]): void {
    this.mockData.set(tableName, data);
  }

  static clear(): void {
    const instance = Database.getInstance();
    instance.mockData.clear();
  }

  async close(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end();
      debug.info("Database", "PostgreSQL connection pool closed");
    }
    if (this.sqliteDb) {
      return new Promise((resolve, reject) => {
        this.sqliteDb!.close((err) => {
          if (err) {
            reject(err);
          } else {
            debug.info("Database", "SQLite database closed");
            resolve();
          }
        });
      });
    }
  }

  static async shutdown(): Promise<void> {
    if (Database._instance) {
      await Database._instance.close();
    }
  }
}

// Type-safe query helpers
export function createQuery<T>(entityClass: new () => T): QueryBuilder<T> {
  return Database.query(entityClass);
}
