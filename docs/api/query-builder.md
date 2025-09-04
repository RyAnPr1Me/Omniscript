# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [query-builder](#query-builder)

## query-builder

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/database/query-builder.ts`

### Classes

#### QueryBuilder

**Properties**:

- `entityClass: new () => T` - 
- `whereConditions: WhereCondition<T>[]` - 
- `orderByFields: Array<{ field: OrderByField<T>; direction: OrderDirection }>` - 
- `limitCount: number` - 
- `skipCount: number` - 
- `database: Database` - 

**Methods**:

##### where

**Signature**: `where(condition: WhereCondition<T>): QueryBuilder<T>`

##### orderBy

**Signature**: `orderBy(field: OrderByField<T>, direction: OrderDirection = 'asc'): QueryBuilder<T>`

##### take

**Signature**: `take(count: number): QueryBuilder<T>`

##### skip

**Signature**: `skip(count: number): QueryBuilder<T>`

##### toSQL

**Signature**: `toSQL():`

##### execute

**Signature**: `async execute(): Promise<T[]>`

##### first

**Signature**: `async first(): Promise<T | null>`

##### count

**Signature**: `async count(): Promise<number>`

##### exists

**Signature**: `async exists(): Promise<boolean>`

##### findAll

**Signature**: `async findAll(): Promise<T[]>`

##### findById

**Signature**: `async findById(id: any): Promise<T | null>`

##### sum

**Signature**: `async sum(field: keyof T): Promise<number>`

##### avg

**Signature**: `async avg(field: keyof T): Promise<number>`

##### max

**Signature**: `async max(field: keyof T): Promise<any>`

##### min

**Signature**: `async min(field: keyof T): Promise<any>`

#### Database

**Properties**:

- `_instance: Database` - 
- `mockData: Map<string, any[]>` - 

**Methods**:

##### getInstance

**Signature**: `static getInstance(): Database`

##### initializeMockData

**Signature**: `private initializeMockData(): void`

##### query

**Signature**: `static query<T>(entityClass: new () => T): QueryBuilder<T>`

##### save

**Signature**: `static async save<T>(entity: T): Promise<T>`

##### delete

**Signature**: `static async delete<T>(entity: T): Promise<void>`

##### find

**Signature**: `static async find<T>(entityClass: new () => T, id: any): Promise<T | null>`

##### findAll

**Signature**: `static async findAll<T>(entityClass: new () => T): Promise<T[]>`

##### getMockData

**Signature**: `getMockData(tableName: string): any[]`

##### setMockData

**Signature**: `setMockData(tableName: string, data: any[]): void`

##### clear

**Signature**: `static clear(): void`

### Functions

#### createQuery

**Signature**: `export function createQuery<T>(entityClass: new () => T): QueryBuilder<T>`


