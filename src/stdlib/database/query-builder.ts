import { debug } from '../../debug';
import { getMetadata } from './decorators';

export type WhereCondition<T> = (entity: T) => boolean;
export type OrderByField<T> = keyof T | ((entity: T) => any);
export type OrderDirection = 'asc' | 'desc';

export class QueryBuilder<T> {
  private entityClass: new () => T;
  private whereConditions: WhereCondition<T>[] = [];
  private orderByFields: Array<{ field: OrderByField<T>; direction: OrderDirection }> = [];
  private limitCount?: number;
  private skipCount?: number;
  private database: Database;

  constructor(entityClass: new () => T, database: Database) {
    this.entityClass = entityClass;
    this.database = database;
    debug.debug('Database', `QueryBuilder created for ${entityClass.name}`);
  }

  where(condition: WhereCondition<T>): QueryBuilder<T> {
    this.whereConditions.push(condition);
    debug.debug('Database', 'WHERE condition added to query');
    return this;
  }

  orderBy(field: OrderByField<T>, direction: OrderDirection = 'asc'): QueryBuilder<T> {
    this.orderByFields.push({ field, direction });
    debug.debug('Database', `ORDER BY ${String(field)} ${direction} added to query`);
    return this;
  }

  take(count: number): QueryBuilder<T> {
    this.limitCount = count;
    debug.debug('Database', `LIMIT ${count} added to query`);
    return this;
  }

  skip(count: number): QueryBuilder<T> {
    this.skipCount = count;
    debug.debug('Database', `OFFSET ${count} added to query`);
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
      query += ' WHERE 1=1'; // Placeholder for now
      debug.debug('Database', 'WHERE conditions would be processed here');
    }

    // Add ORDER BY
    if (this.orderByFields.length > 0) {
      const orderClauses = this.orderByFields.map(({ field, direction }) => {
        const fieldName = typeof field === 'string' ? field : 'id'; // Simplified
        return `${fieldName} ${direction.toUpperCase()}`;
      });
      query += ` ORDER BY ${orderClauses.join(', ')}`;
    }

    // Add LIMIT
    if (this.limitCount !== undefined) {
      query += ` LIMIT ${this.limitCount}`;
    }

    // Add OFFSET
    if (this.skipCount !== undefined) {
      query += ` OFFSET ${this.skipCount}`;
    }

    debug.debug('Database', `Generated SQL: ${query}`);
    return { query, params };
  }

  // Execute query with actual filtering and sorting
  async execute(): Promise<T[]> {
    const { query } = this.toSQL();
    debug.info('Database', `Executing query: ${query}`);
    
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
        
        if (typeof field === 'string') {
          aVal = (a as any)[field];
          bVal = (b as any)[field];
        } else if (typeof field === 'function') {
          aVal = field(a);
          bVal = field(b);
        } else {
          aVal = (a as any).id;
          bVal = (b as any).id;
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
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
    return data.length > 0 ? Math.max(...data.map(item => (item as any)[field])) : null;
  }

  async min(field: keyof T): Promise<any> {
    const data = await this.execute();
    return data.length > 0 ? Math.min(...data.map(item => (item as any)[field])) : null;
  }
}

// Database utility class with enhanced functionality
export class Database {
  private static _instance: Database;
  private mockData: Map<string, any[]> = new Map();

  private constructor() {
    // Don't initialize mock data by default - let tests set up their own data
  }

  static getInstance(): Database {
    if (!Database._instance) {
      Database._instance = new Database();
    }
    return Database._instance;
  }

  private initializeMockData(): void {
    // Initialize with some mock data for testing
    this.mockData.set('user', [
      { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date().toISOString() },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date().toISOString() },
    ]);
    this.mockData.set('post', [
      { id: 1, title: 'Hello World', content: 'First post', userId: 1, createdAt: new Date().toISOString() },
      { id: 2, title: 'TypeScript Tips', content: 'Some TypeScript tips', userId: 1, createdAt: new Date().toISOString() },
    ]);
  }

  static query<T>(entityClass: new () => T): QueryBuilder<T> {
    const instance = Database.getInstance();
    return new QueryBuilder(entityClass, instance);
  }

  static async save<T>(entity: T): Promise<T> {
    debug.info('Database', `Saving entity of type ${entity?.constructor.name}`);
    
    const instance = Database.getInstance();
    const tableName = entity?.constructor.name.toLowerCase();
    if (!tableName) throw new Error('Invalid entity: no constructor name');
    
    const data = instance.mockData.get(tableName) || [];
    
    // Modify entity in place to maintain reference equality
    const entityData = entity as any;
    
    if (entityData.id) {
      // Update existing entity
      const index = data.findIndex(item => item.id === entityData.id);
      if (index >= 0) {
        Object.assign(data[index], entityData);
      }
    } else {
      // Create new entity - assign ID and timestamps to original object
      entityData.id = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
      if (!entityData.createdAt) {
        entityData.createdAt = new Date().toISOString();
      }
      data.push({ ...entityData });
      instance.mockData.set(tableName, data);
    }
    
    return entity;
  }

  static async delete<T>(entity: T): Promise<void> {
    debug.info('Database', `Deleting entity of type ${entity?.constructor.name}`);
    
    const instance = Database.getInstance();
    const tableName = entity?.constructor.name.toLowerCase();
    if (!tableName) throw new Error('Invalid entity: no constructor name');
    
    const data = instance.mockData.get(tableName) || [];
    const entityData = entity as any;
    
    const index = data.findIndex(item => item.id === entityData.id);
    if (index >= 0) {
      data.splice(index, 1);
      instance.mockData.set(tableName, data);
    }
  }

  static async find<T>(entityClass: new () => T, id: any): Promise<T | null> {
    debug.info('Database', `Finding ${entityClass.name} with id ${id}`);
    
    const instance = Database.getInstance();
    const tableName = entityClass.name.toLowerCase();
    if (!tableName) throw new Error('Invalid entity class: no name');
    
    const data = instance.mockData.get(tableName) || [];
    
    const found = data.find(item => item.id === id);
    return found ? (found as T) : null;
  }

  static async findAll<T>(entityClass: new () => T): Promise<T[]> {
    debug.info('Database', `Finding all ${entityClass.name} entities`);
    
    const instance = Database.getInstance();
    const tableName = entityClass.name.toLowerCase();
    if (!tableName) throw new Error('Invalid entity class: no name');
    
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
}

// Type-safe query helpers
export function createQuery<T>(entityClass: new () => T): QueryBuilder<T> {
  return Database.query(entityClass);
}