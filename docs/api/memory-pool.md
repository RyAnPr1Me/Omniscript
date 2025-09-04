# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [memory-pool](#memory-pool)

## memory-pool

**File**: `/home/runner/work/Omniscript/Omniscript/src/runtime/memory-pool.ts`

### Classes

#### MemoryPool

**Properties**:

- `pool: T[]` - 
- `allocated: Set<T>` - 
- `options: Required<MemoryPoolOptions>` - 
- `totalAllocated: any` - 
- `totalReleased: any` - 

**Methods**:

##### initialize

**Signature**: `private initialize(): void`

##### createObject

**Signature**: `private createObject(): T`

##### allocate

**Signature**: `allocate(size?: number): T`

##### release

**Signature**: `release(object: T): void`

##### clear

**Signature**: `clear(): void`

##### getStats

**Signature**: `getStats()`

##### getTotalSize

**Signature**: `private getTotalSize(): number`

##### grow

**Signature**: `private grow(): void`

#### MemoryPoolManager

**Properties**:

- `pools: Map<string, MemoryPool>` - 

**Methods**:

##### createPool

**Signature**: `createPool<T>(name: string, options: MemoryPoolOptions): MemoryPool<T>`

##### getPool

**Signature**: `getPool(name: string): MemoryPool | undefined`

##### removePool

**Signature**: `removePool(name: string): void`

##### getAllStats

**Signature**: `getAllStats()`

##### clearAll

**Signature**: `clearAll(): void`

### Interfaces

#### MemoryPoolOptions

**Properties**:

- `initialSize: number` - 
- `maxSize: number` - 
- `objectType: any` - 
- `growthFactor: number` - 


