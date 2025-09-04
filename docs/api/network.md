# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [network](#network)

## network

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/network.ts`

### Classes

#### HTTPClient

**Properties**:

- `defaultOptions: HTTPOptions` - 

**Methods**:

##### enableDebugging

**Signature**: `static enableDebugging(enabled: boolean = true): void`

##### request

**Signature**: `async request<T = any>(method: string, url: string, options: HTTPOptions &`

##### get

**Signature**: `async get<T = any>(url: string, options?: HTTPOptions): Promise<HTTPResponse<T>>`

##### post

**Signature**: `async post<T = any>(url: string, body?: any, options?: HTTPOptions): Promise<HTTPResponse<T>>`

##### put

**Signature**: `async put<T = any>(url: string, body?: any, options?: HTTPOptions): Promise<HTTPResponse<T>>`

##### patch

**Signature**: `async patch<T = any>(url: string, body?: any, options?: HTTPOptions): Promise<HTTPResponse<T>>`

##### delete

**Signature**: `async delete<T = any>(url: string, options?: HTTPOptions): Promise<HTTPResponse<T>>`

##### head

**Signature**: `async head<T = any>(url: string, options?: HTTPOptions): Promise<HTTPResponse<T>>`

##### delay

**Signature**: `private delay(ms: number): Promise<void>`

#### HTTP

**Extends**: `HTTPClient`

**Methods**:

##### get

**Signature**: `static async get(url: string, headers?: Record<string, string>): Promise<Response>`

##### post

**Signature**: `static async post(url: string, body: any, headers?: Record<string, string>): Promise<Response>`

##### put

**Signature**: `static async put(url: string, body: any, headers?: Record<string, string>): Promise<Response>`

##### delete

**Signature**: `static async delete(url: string, headers?: Record<string, string>): Promise<Response>`

#### WebSocketClient

**Properties**:

- `ws: globalThis.WebSocket | null` - 
- `options: WebSocketOptions` - 
- `reconnectCount: any` - 
- `isReconnecting: any` - 
- `heartbeatTimer: NodeJS.Timeout` - 
- `messageHandlers: Map<string, Function[]>` - 
- `eventHandlers: Map<string, Function[]>` - 

**Methods**:

##### enableDebugging

**Signature**: `enableDebugging(enabled: boolean = true): void`

##### connect

**Signature**: `private connect(): void`

##### handleMessage

**Signature**: `private handleMessage(data: string): void`

##### handleReconnect

**Signature**: `private handleReconnect(): void`

##### startHeartbeat

**Signature**: `private startHeartbeat(): void`

##### stopHeartbeat

**Signature**: `private stopHeartbeat(): void`

##### send

**Signature**: `send(data: any): void`

##### on

**Signature**: `on(event: string, handler: Function): void`

##### off

**Signature**: `off(event: string, handler?: Function): void`

##### emit

**Signature**: `private emit(event: string, ...args: any[]): void`

##### onMessage

**Signature**: `onMessage(callback: (data: any) => void): void`

##### onEvent

**Signature**: `onEvent(eventType: string, callback: (data: any) => void): void`

##### close

**Signature**: `close(): void`

#### WebSocket

**Extends**: `WebSocketClient`

#### AsyncUtils

**Methods**:

##### withTimeout

**Signature**: `static async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T>`

##### withRetry

**Signature**: `static async withRetry<T>(
    operation: () => Promise<T>, 
    maxAttempts: number = 3, 
    delay: number = 1000
  ): Promise<T>`

##### withCancellation

**Signature**: `static async withCancellation<T>(promise: Promise<T>, cancelToken:`

##### propagateErrors

**Signature**: `static async propagateErrors<T>(promise: Promise<T>): Promise<T>`

##### delay

**Signature**: `static delay(ms: number): Promise<void>`

##### batch

**Signature**: `static async batch<T, R>(
    items: T[], 
    batchSize: number, 
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]>`

##### parallel

**Signature**: `static async parallel<T, R>(
    items: T[], 
    processor: (item: T, index: number) => Promise<R>,
    concurrency: number = 10
  ): Promise<R[]>`

#### Semaphore

**Properties**:

- `permits: number` - 
- `queue: (() => void)[]` - 

**Methods**:

##### acquire

**Signature**: `async acquire(): Promise<void>`

##### release

**Signature**: `release(): void`

#### EventSourcingServer

**Properties**:

- `clients: WebSocketClient[]` - 

**Methods**:

##### enableDebugging

**Signature**: `enableDebugging(enabled: boolean = true): void`

##### broadcastEvent

**Signature**: `broadcastEvent(event:`

##### addClient

**Signature**: `addClient(client: WebSocketClient): void`

##### removeClient

**Signature**: `removeClient(client: WebSocketClient): void`

### Interfaces

#### HTTPOptions

**Properties**:

- `timeout: number` - 
- `retries: number` - 
- `retryDelay: number` - 
- `headers: Record<string, string>` - 
- `validateStatus: (status: number) => boolean` - 

#### HTTPResponse

**Properties**:

- `data: T` - 
- `status: number` - 
- `statusText: string` - 
- `headers: Record<string, string>` - 
- `url: string` - 

#### WebSocketOptions

**Properties**:

- `protocols: string | string[]` - 
- `reconnectAttempts: number` - 
- `reconnectDelay: number` - 
- `heartbeatInterval: number` - 


