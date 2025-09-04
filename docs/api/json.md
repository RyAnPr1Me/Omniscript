# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [json](#json)

## json

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/json.ts`

### Classes

#### Json

**Methods**:

##### parse

Parse JSON string with enhanced error handling

**Signature**: `static parse<T = any>(text: string, options?: JsonOptions): T`

##### safeParse

Safely parse JSON with default value on error

**Signature**: `static safeParse<T = any>(text: string, defaultValue: T, options?: JsonOptions): T`

##### stringify

Stringify object to JSON with enhanced options

**Signature**: `static stringify(value: any, options?: JsonOptions): string`

##### prettyPrint

Pretty print JSON with indentation

**Signature**: `static prettyPrint(value: any, indentSize: number = 2): string`

##### isValid

Check if string is valid JSON

**Signature**: `static isValid(text: string): boolean`

##### clone

Deep clone object using JSON serialization

**Signature**: `static clone<T>(obj: T): T`

##### merge

Merge two JSON objects

**Signature**: `static merge(target: any, source: any): any`

##### deepMerge

Deep merge two JSON objects recursively

**Signature**: `static deepMerge(target: any, source: any): any`

##### getPath

Extract value at JSON path (simple dot notation)

**Signature**: `static getPath(obj: any, path: string): any`

##### setPath

Set value at JSON path (simple dot notation)

**Signature**: `static setPath(obj: any, path: string, value: any): any`

##### removePath

Remove value at JSON path

**Signature**: `static removePath(obj: any, path: string): any`

##### flatten

Flatten nested JSON object

**Signature**: `static flatten(obj: any, prefix: string = ''): Record<string, any>`

##### unflatten

Unflatten flattened JSON object

**Signature**: `static unflatten(obj: Record<string, any>): any`

##### getAllKeys

Get all keys from nested JSON object

**Signature**: `static getAllKeys(obj: any, prefix: string = ''): string[]`

##### equals

Compare two JSON objects for deep equality

**Signature**: `static equals(obj1: any, obj2: any): boolean`

### Interfaces

#### JsonOptions

**Properties**:

- `space: string | number` - 
- `replacer: (key: string, value: any) => any` - 
- `reviver: (key: string, value: any) => any` - 


