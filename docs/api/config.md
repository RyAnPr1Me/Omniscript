# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [config](#config)

## config

**File**: `src/stdlib/config.ts`

### Classes

#### EnvironmentSource

**Implements**: `ConfigSource`

**Properties**:

- `name: any` - 
- `priority: any` - 

**Methods**:

##### load

**Signature**: `async load(): Promise<Record<string, any>>`

##### transformKey

**Signature**: `private transformKey(key: string): string`

##### parseValue

**Signature**: `private parseValue(value: string): any`

#### FileSource

**Implements**: `ConfigSource`

**Properties**:

- `name: string` - 
- `priority: any` - 
- `watchers: ConfigChangeListener[]` - 

**Methods**:

##### load

**Signature**: `async load(): Promise<Record<string, any>>`

##### watch

**Signature**: `watch(callback: ConfigChangeListener): void`

##### save

**Signature**: `async save(config: Record<string, any>): Promise<void>`

#### MemorySource

**Implements**: `ConfigSource`

**Properties**:

- `name: any` - 
- `priority: any` - 

**Methods**:

##### load

**Signature**: `async load(): Promise<Record<string, any>>`

##### setConfig

**Signature**: `setConfig(config: Record<string, any>): void`

##### updateConfig

**Signature**: `updateConfig(updates: Record<string, any>): void`

#### Config

**Properties**:

- `sources: ConfigSource[]` - 
- `cache: Record<string, any>` - 
- `schema: any` - 
- `listeners: ConfigChangeListener[]` - 
- `lastCacheUpdate: any` - 
- `cacheTimeout: number` - 
- `caseSensitive: boolean` - 
- `allowOverrides: boolean` - 

**Methods**:

##### addSource

**Signature**: `addSource(source: ConfigSource): void`

##### removeSource

**Signature**: `removeSource(name: string): boolean`

##### refreshCache

**Signature**: `async refreshCache(): Promise<void>`

##### mergeConfig

**Signature**: `private mergeConfig(target: Record<string, any>, source: Record<string, any>): void`

##### ensureFreshCache

**Signature**: `private async ensureFreshCache(): Promise<void>`

##### get

**Signature**: `async get<T = any>(key: string, defaultValue?: T): Promise<T>`

##### getSync

**Signature**: `getSync<T = any>(key: string, defaultValue?: T): T`

##### set

**Signature**: `async set(key: string, value: any): Promise<void>`

##### has

**Signature**: `async has(key: string): Promise<boolean>`

##### keys

**Signature**: `async keys(): Promise<string[]>`

##### getAllKeys

**Signature**: `private getAllKeys(obj: any, prefix = ''): string[]`

##### getAll

**Signature**: `async getAll(): Promise<Record<string, any>>`

##### save

**Signature**: `async save(): Promise<void>`

##### onChange

**Signature**: `onChange(listener: ConfigChangeListener): () => void`

##### notifyChange

**Signature**: `private notifyChange(event: ConfigChangeEvent): void`

##### enableWatching

**Signature**: `private enableWatching(): void`

##### validate

**Signature**: `async validate(): Promise<ValidationResult>`

##### reset

**Signature**: `async reset(): Promise<void>`

##### isDevelopment

**Signature**: `isDevelopment(): boolean`

##### isProduction

**Signature**: `isProduction(): boolean`

##### isTest

**Signature**: `isTest(): boolean`

#### ConfigFactory

**Methods**:

##### createDefault

**Signature**: `static createDefault(): Config`

##### createFromEnv

**Signature**: `static createFromEnv(prefix?: string): Config`

##### createFromFile

**Signature**: `static createFromFile(filename: string, format: 'json' | 'yaml' | 'xml' = 'json'): Config`

##### createWithDefaults

**Signature**: `static createWithDefaults(defaults: Record<string, any>): Config`

##### createWithSchema

**Signature**: `static createWithSchema(schema: any, sources?: ConfigSource[]): Config`

### Interfaces

#### ConfigSource

**Properties**:

- `name: string` - 
- `priority: number` - 

**Methods**:

##### load

**Signature**: `load(): Promise<Record<string, any>>;`

##### watch

**Signature**: `watch?(callback: (changes: Record<string, any>) => void): void;`

##### save

**Signature**: `save?(config: Record<string, any>): Promise<void>;`

#### ConfigOptions

**Properties**:

- `sources: ConfigSource[]` - 
- `schema: any` - 
- `defaultValues: Record<string, any>` - 
- `enableWatch: boolean` - 
- `cacheTimeout: number` - 
- `caseSensitive: boolean` - 
- `allowOverrides: boolean` - 

#### ConfigChangeEvent

**Properties**:

- `key: string` - 
- `oldValue: any` - 
- `newValue: any` - 
- `source: string` - 


