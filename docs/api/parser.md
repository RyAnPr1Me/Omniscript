# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [parser](#parser)

## parser

**File**: `/home/runner/work/Omniscript/Omniscript/src/functional/parser.ts`

### Classes

#### FunctionalParser

**Properties**:

- `tokens: Token[]` - 
- `pos: any` - 

**Methods**:

##### parse

**Signature**: `parse(src: string): Program`

##### importDecl

**Signature**: `private importDecl(): Expression`

##### current

**Signature**: `private current(): Token`

##### peek

**Signature**: `private peek(t: string): boolean`

##### consume

**Signature**: `private consume(t?: string): Token`

##### consumeOptional

**Signature**: `private consumeOptional(t: string): boolean`

##### expression

**Signature**: `private expression(): Expression`

##### pipe

**Signature**: `private pipe(): Expression`

##### ifExpr

**Signature**: `private ifExpr(): Expression`

##### matchExpr

**Signature**: `private matchExpr(): Expression`

##### letExpr

**Signature**: `private letExpr(): Expression`

##### classDecl

**Signature**: `private classDecl(): Expression`

##### binary

**Signature**: `private binary(): Expression`

##### comparison

**Signature**: `private comparison(): Expression`

##### additive

**Signature**: `private additive(): Expression`

##### multiplicative

**Signature**: `private multiplicative(): Expression`

##### unary

**Signature**: `private unary(): Expression`

##### lambda

**Signature**: `private lambda(): Expression`

##### call

**Signature**: `private call(): any`

##### primary

**Signature**: `private primary(): any`


