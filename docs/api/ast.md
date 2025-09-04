# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [ast](#ast)

## ast

**File**: `/home/runner/work/Omniscript/Omniscript/src/functional/ast.ts`

### Interfaces

#### Env

**Properties**:

- `parent: Env` - 
- `values: Map<string, any>` - 
- `immutable: Set<string>` - 

#### LambdaValue

**Properties**:

- `__tag: 'lambda'` - 
- `params: string[]` - 
- `body: Expression` - 
- `closure: Env` - 
- `__native: (...args: any[]) => any` - 

### Functions

#### createEnv

**Signature**: `export function createEnv(parent?: Env): Env`

#### envDefine

**Signature**: `export function envDefine(env: Env, name: string, value: any)`

#### envLookup

**Signature**: `export function envLookup(env: Env, name: string): any`


