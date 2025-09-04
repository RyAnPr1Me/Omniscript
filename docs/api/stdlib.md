# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [stdlib](#stdlib)

## stdlib

**File**: `src/stdlib/index.ts`

### Classes

#### Console

**Methods**:

##### log

**Signature**: `static log(...args: any[])`

#### HTTP

**Methods**:

##### fetch

**Signature**: `static async fetch(url: string, options?: RequestInit)`

##### createServer

**Signature**: `static createServer(path: string, handler: (req: any, res: any) => void)`

#### DatabaseV2

**Methods**:

##### connect

**Signature**: `static async connect(connectionString: string)`

##### transaction

**Signature**: `static async transaction<T>(callback: () => Promise<T>): Promise<T>`

#### DOM

**Methods**:

##### querySelector

**Signature**: `static querySelector(selector: string)`

##### createElement

**Signature**: `static createElement(tag: string)`


