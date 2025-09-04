# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [logging](#logging)

## logging

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/logging.ts`

### Classes

#### Logger

**Properties**:

- `config: Required<LoggerConfig>` - 
- `correlationId: string` - 
- `metadata: Record<string, any>` - 

**Methods**:

##### trace

**Signature**: `trace(message: string, metadata?: Record<string, any>): void`

##### debug

**Signature**: `debug(message: string, metadata?: Record<string, any>): void`

##### info

**Signature**: `info(message: string, metadata?: Record<string, any>): void`

##### warn

**Signature**: `warn(message: string, metadata?: Record<string, any>): void`

##### error

**Signature**: `error(message: string, error?: Error, metadata?: Record<string, any>): void`

##### fatal

**Signature**: `fatal(message: string, error?: Error, metadata?: Record<string, any>): void`

##### log

**Signature**: `private log(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error): void`

##### shouldLog

**Signature**: `private shouldLog(level: LogLevel): boolean`

##### captureSource

**Signature**: `private captureSource(): LogEntry['source']`

##### setLevel

**Signature**: `setLevel(level: LogLevel): this`

##### setContext

**Signature**: `setContext(context: string): this`

##### addOutput

**Signature**: `addOutput(output: LogOutput): this`

##### removeOutput

**Signature**: `removeOutput(output: LogOutput): this`

##### addFilter

**Signature**: `addFilter(filter: LogFilter): this`

##### addFormatter

**Signature**: `addFormatter(formatter: LogFormatter): this`

##### setCorrelationId

**Signature**: `setCorrelationId(id: string): this`

##### addMetadata

**Signature**: `addMetadata(key: string, value: any): this`

##### clearMetadata

**Signature**: `clearMetadata(): this`

##### child

**Signature**: `child(context: string, metadata?: Record<string, any>): Logger`

##### time

**Signature**: `time(label: string): () => void`

##### profile

**Signature**: `async profile<T>(label: string, operation: () => Promise<T>): Promise<T>`

##### flush

**Signature**: `async flush(): Promise<void>`

##### close

**Signature**: `async close(): Promise<void>`

#### ConsoleOutput

**Implements**: `LogOutput`

**Properties**:

- `formatter: LogFormatter` - 

**Methods**:

##### write

**Signature**: `write(entry: LogEntry): void`

#### FileOutput

**Implements**: `LogOutput`

**Properties**:

- `buffer: string[]` - 
- `lastFlush: any` - 
- `flushInterval: any` - 

**Methods**:

##### write

**Signature**: `write(entry: LogEntry): void`

##### flush

**Signature**: `async flush(): Promise<void>`

##### close

**Signature**: `async close(): Promise<void>`

#### MemoryOutput

**Implements**: `LogOutput`

**Properties**:

- `entries: LogEntry[]` - 
- `maxEntries: number` - 

**Methods**:

##### write

**Signature**: `write(entry: LogEntry): void`

##### getEntries

**Signature**: `getEntries(): LogEntry[]`

##### getEntriesByLevel

**Signature**: `getEntriesByLevel(level: LogLevel): LogEntry[]`

##### getEntriesSince

**Signature**: `getEntriesSince(timestamp: DateTime): LogEntry[]`

##### clear

**Signature**: `clear(): void`

##### count

**Signature**: `count(): number`

#### DefaultFormatter

**Implements**: `LogFormatter`

**Methods**:

##### format

**Signature**: `format(entry: LogEntry): string`

#### JsonFormatter

**Implements**: `LogFormatter`

**Methods**:

##### format

**Signature**: `format(entry: LogEntry): object`

#### CompactFormatter

**Implements**: `LogFormatter`

**Methods**:

##### format

**Signature**: `format(entry: LogEntry): string`

#### LevelFilter

**Implements**: `LogFilter`

**Methods**:

##### shouldLog

**Signature**: `shouldLog(entry: LogEntry): boolean`

#### ContextFilter

**Implements**: `LogFilter`

**Methods**:

##### shouldLog

**Signature**: `shouldLog(entry: LogEntry): boolean`

#### RateLimitFilter

**Implements**: `LogFilter`

**Properties**:

- `counts: any` - 

**Methods**:

##### shouldLog

**Signature**: `shouldLog(entry: LogEntry): boolean`

#### LoggerFactory

**Methods**:

##### createConsoleLogger

**Signature**: `static createConsoleLogger(level: LogLevel = 'info'): Logger`

##### createFileLogger

**Signature**: `static createFileLogger(filename: string, level: LogLevel = 'info'): Logger`

##### createDualLogger

**Signature**: `static createDualLogger(filename: string, level: LogLevel = 'info'): Logger`

##### createProductionLogger

**Signature**: `static createProductionLogger(serviceName: string): Logger`

##### createDevelopmentLogger

**Signature**: `static createDevelopmentLogger(context: string = 'dev'): Logger`

### Interfaces

#### LogEntry

**Properties**:

- `timestamp: DateTime` - 
- `level: LogLevel` - 
- `message: string` - 
- `context: string` - 
- `metadata: Record<string, any>` - 
- `error: Error` - 
- `source: {
    file?: string;
    line?: number;
    function?: string;
  }` - 
- `traceId: string` - 
- `spanId: string` - 

#### LogOutput

**Methods**:

##### write

**Signature**: `write(entry: LogEntry): Promise<void> | void;`

##### flush

**Signature**: `flush?(): Promise<void> | void;`

##### close

**Signature**: `close?(): Promise<void> | void;`

#### LoggerConfig

**Properties**:

- `level: LogLevel` - 
- `outputs: LogOutput[]` - 
- `context: string` - 
- `enableStackTrace: boolean` - 
- `enableDistributedTracing: boolean` - 
- `filters: LogFilter[]` - 
- `formatters: LogFormatter[]` - 

#### LogFilter

**Methods**:

##### shouldLog

**Signature**: `shouldLog(entry: LogEntry): boolean;`

#### LogFormatter

**Methods**:

##### format

**Signature**: `format(entry: LogEntry): string | object;`


