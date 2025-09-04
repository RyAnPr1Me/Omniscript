# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [cache](#cache)

## cache

**File**: `src/stdlib/cache.ts`

### Classes

#### BaseCache

**Properties**:

- `stats: CacheStats` - 
- `defaultOptions: CacheOptions` - 

**Methods**:

##### get

**Signature**: `abstract get(key: string): Promise<T | null>;`

##### set

**Signature**: `abstract set(key: string, value: T, options?: CacheOptions): Promise<void>;`

##### delete

**Signature**: `abstract delete(key: string): Promise<boolean>;`

##### clear

**Signature**: `abstract clear(): Promise<void>;`

##### keys

**Signature**: `abstract keys(): Promise<string[]>;`

##### has

**Signature**: `async has(key: string): Promise<boolean>`

##### getStats

**Signature**: `getStats(): CacheStats`

##### resetStats

**Signature**: `resetStats(): void`

##### updateHitRate

**Signature**: `protected updateHitRate(): void`

##### isExpired

**Signature**: `protected isExpired(entry: CacheEntry<T>): boolean`

##### calculateSize

**Signature**: `protected calculateSize(value: T): number`

##### mget

**Signature**: `async mget(keys: string[]): Promise<Record<string, T | null>>`

##### mset

**Signature**: `async mset(entries: Record<string, T>, options?: CacheOptions): Promise<void>`

##### deleteByTag

**Signature**: `async deleteByTag(tag: string): Promise<number>`

##### getEntry

**Signature**: `protected abstract getEntry(key: string): Promise<CacheEntry<T> | null>;`

#### MemoryCache

**Extends**: `BaseCache`

**Properties**:

- `storage: any` - 
- `accessOrder: any` - 

**Methods**:

##### get

**Signature**: `async get(key: string): Promise<T | null>`

##### set

**Signature**: `async set(key: string, value: T, options?: CacheOptions): Promise<void>`

##### delete

**Signature**: `async delete(key: string): Promise<boolean>`

##### clear

**Signature**: `async clear(): Promise<void>`

##### keys

**Signature**: `async keys(): Promise<string[]>`

##### getEntry

**Signature**: `protected async getEntry(key: string): Promise<CacheEntry<T> | null>`

##### evictIfNeeded

**Signature**: `private async evictIfNeeded(newEntrySize: number): Promise<void>`

##### evictExpired

**Signature**: `private async evictExpired(): Promise<void>`

##### evictLRU

**Signature**: `private async evictLRU(count: number): Promise<void>`

#### TieredCache

**Extends**: `BaseCache`

**Methods**:

##### get

**Signature**: `async get(key: string): Promise<T | null>`

##### set

**Signature**: `async set(key: string, value: T, options?: CacheOptions): Promise<void>`

##### delete

**Signature**: `async delete(key: string): Promise<boolean>`

##### clear

**Signature**: `async clear(): Promise<void>`

##### keys

**Signature**: `async keys(): Promise<string[]>`

##### getEntry

**Signature**: `protected async getEntry(key: string): Promise<CacheEntry<T> | null>`

##### getStats

**Signature**: `getStats(): CacheStats`

#### Memoizer

**Properties**:

- `cache: BaseCache<T>` - 

**Methods**:

##### memoize

**Signature**: `memoize<F extends (...args: any[]) => any>(
    fn: F,
    keyGenerator?: (...args: Parameters<F>) => string
  ): F`

##### clear

**Signature**: `clear(): Promise<void>`

##### getStats

**Signature**: `getStats(): CacheStats`

#### WriteThroughCache

**Extends**: `BaseCache`

**Methods**:

##### get

**Signature**: `async get(key: string): Promise<T | null>`

##### set

**Signature**: `async set(key: string, value: T, options?: CacheOptions): Promise<void>`

##### delete

**Signature**: `async delete(key: string): Promise<boolean>`

##### clear

**Signature**: `async clear(): Promise<void>`

##### keys

**Signature**: `async keys(): Promise<string[]>`

##### getEntry

**Signature**: `protected async getEntry(key: string): Promise<CacheEntry<T> | null>`

#### WriteBehindCache

**Extends**: `BaseCache`

**Properties**:

- `writeQueue: any` - 
- `writeTimer: NodeJS.Timeout | null` - 

**Methods**:

##### get

**Signature**: `async get(key: string): Promise<T | null>`

##### set

**Signature**: `async set(key: string, value: T, options?: CacheOptions): Promise<void>`

##### delete

**Signature**: `async delete(key: string): Promise<boolean>`

##### clear

**Signature**: `async clear(): Promise<void>`

##### keys

**Signature**: `async keys(): Promise<string[]>`

##### getEntry

**Signature**: `protected async getEntry(key: string): Promise<CacheEntry<T> | null>`

##### flush

**Signature**: `async flush(): Promise<void>`

##### startWriteTimer

**Signature**: `private startWriteTimer(): void`

##### close

**Signature**: `async close(): Promise<void>`

#### CacheFactory

**Methods**:

##### createMemoryCache

**Signature**: `static createMemoryCache<T = any>(options?: CacheOptions): MemoryCache<T>`

##### createTieredCache

**Signature**: `static createTieredCache<T = any>(options?: CacheOptions): TieredCache<T>`

##### createMemoizer

**Signature**: `static createMemoizer<T = any>(maxSize = 100): Memoizer<T>`

### Interfaces

#### CacheEntry

**Properties**:

- `value: T` - 
- `createdAt: DateTime` - 
- `expiresAt: DateTime` - 
- `accessCount: number` - 
- `lastAccessed: DateTime` - 
- `size: number` - 
- `tags: string[]` - 

#### CacheOptions

**Properties**:

- `ttl: number` - 
- `maxSize: number` - 
- `maxMemory: number` - 
- `tags: string[]` - 
- `serialize: boolean` - 

#### CacheStats

**Properties**:

- `hits: number` - 
- `misses: number` - 
- `size: number` - 
- `memory: number` - 
- `hitRate: number` - 
- `evictions: number` - 

#### CacheStorage

**Methods**:

##### get

**Signature**: `get(key: string): Promise<CacheEntry<T> | null>;`

##### set

**Signature**: `set(key: string, entry: CacheEntry<T>): Promise<void>;`

##### delete

**Signature**: `delete(key: string): Promise<boolean>;`

##### clear

**Signature**: `clear(): Promise<void>;`

##### keys

**Signature**: `keys(): Promise<string[]>;`

##### size

**Signature**: `size(): Promise<number>;`

### Functions

#### cached

**Signature**: `export function cached<T extends (...args: any[]) => any>(
  cache: BaseCache,
  options:`


