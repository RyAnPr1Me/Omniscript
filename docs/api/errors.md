# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [errors](#errors)

## errors

**File**: `/home/runner/work/Omniscript/Omniscript/src/errors/index.ts`

### Classes

#### OmniscriptError

**Extends**: `Error`

**Properties**:

- `location: SourceLocation` - 
- `code: string` - 
- `suggestions: string[]` - 
- `severity: 'error' | 'warning' | 'info'` - 

**Methods**:

##### withLineCol

**Signature**: `static withLineCol(message: string, line: number = 0, column: number = 0): OmniscriptError`

##### formatError

**Signature**: `public formatError(): string`

##### getContextLines

**Signature**: `private getContextLines(): string`

#### TypeMismatchError

**Extends**: `OmniscriptError`

#### SyntaxError

**Extends**: `OmniscriptError`

#### ReferenceError

**Extends**: `OmniscriptError`

#### PatternMatchError

**Extends**: `OmniscriptError`

#### RuntimeError

**Extends**: `OmniscriptError`

**Properties**:

- `cause: Error` - 

#### ErrorFormatter

**Methods**:

##### formatMultiple

**Signature**: `static formatMultiple(errors: OmniscriptError[]): string`

##### createDiagnostic

**Signature**: `static createDiagnostic(
    message: string, 
    location: SourceLocation, 
    severity: 'error' | 'warning' | 'info' = 'error'
  ): OmniscriptError`

### Interfaces

#### SourceLocation

**Properties**:

- `filename: string` - 
- `line: number` - 
- `column: number` - 
- `source: string` - 


