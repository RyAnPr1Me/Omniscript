# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [connections](#connections)

## connections

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/database/connections.ts`

### Classes

#### SQLiteConnection

**Properties**:

- `db: { close: (cb: (err: Error | null) => void) => void }` - 

**Methods**:

##### close

**Signature**: `close(): Promise<void>`

#### PostgresConnection

**Properties**:

- `pool: { end?: () => Promise<void> }` - 

**Methods**:

##### close

**Signature**: `async close(): Promise<void>`


