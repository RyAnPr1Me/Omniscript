# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [OmniscriptParser](#omniscriptparser)

## OmniscriptParser

**File**: `/home/runner/work/Omniscript/Omniscript/src/parser/OmniscriptParser.ts`

### Classes

#### OmniscriptParser

OmniscriptParser is responsible for parsing Omniscript source code into an AST.
Supports advanced features like:
- Generic type parameters
- Union and intersection types
- Async/await functions
- Decorators
- Enhanced error recovery

**Extends**: `Parser`

**Properties**:

- `_state: any` - 
- `EOF: any` - 
- `VAR: any` - 
- `AT: any` - 
- `COLON: any` - 
- `ASSIGN: any` - 
- `IDENTIFIER: any` - 
- `LPAREN: any` - 
- `RPAREN: any` - 
- `DOT: any` - 
- `COMMA: any` - 
- `PLUS: any` - 
- `MINUS: any` - 
- `MULTIPLY: any` - 
- `DIVIDE: any` - 
- `MOD: any` - 
- `EQ: any` - 
- `NEQ: any` - 
- `LT: any` - 
- `GT: any` - 
- `LTE: any` - 
- `GTE: any` - 
- `AND: any` - 
- `OR: any` - 
- `NOT: any` - 
- `STRING: any` - 
- `NUMBER: any` - 
- `TRUE: any` - 
- `FALSE: any` - 
- `NULL: any` - 
- `LBRACKET: any` - 
- `RBRACKET: any` - 
- `LBRACE: any` - 
- `RBRACE: any` - 
- `ASYNC: any` - 
- `AWAIT: any` - 
- `FN: any` - 
- `EXTENDS: any` - 
- `PIPE: any` - 
- `GENERIC: any` - 
- `QUESTION: any` - 
- `NULLISH_ASSIGN: any` - 
- `RETURN: any` - 
- `IF: any` - 
- `ELSE: any` - 
- `WHILE: any` - 
- `FOR: any` - 
- `TRY: any` - 
- `CATCH: any` - 
- `FINALLY: any` - 
- `THROW: any` - 
- `LBRACE_FN: any` - 
- `RBRACE_FN: any` - 
- `SEMI: any` - 
- `MATCH: any` - 
- `ARROW: any` - 
- `DEF: any` - 
- `OBJECT: any` - 
- `USE: any` - 
- `DOUBLE_COLON: any` - 

**Methods**:

##### addTokenNode

**Signature**: `addTokenNode(token: any)`

##### program

**Signature**: `program(): Program`

##### parseStatements

**Signature**: `parseStatements(): Statement[]`

##### statement

**Signature**: `statement(): Statement`

##### variableDeclaration

**Signature**: `variableDeclaration(): VariableDeclaration`

##### decorator

**Signature**: `decorator(): Decorator`

##### qualifiedName

**Signature**: `qualifiedName(): string`

##### argumentList

**Signature**: `argumentList(): any[]`

##### type

**Signature**: `type(): string`

##### expression

**Signature**: `expression(): Expression`

##### parseBinaryExpression

**Signature**: `private parseBinaryExpression(precedence: number): Expression`

##### parseUnaryExpression

**Signature**: `private parseUnaryExpression(): Expression`

##### parsePrimaryExpression

**Signature**: `private parsePrimaryExpression(): Expression`

##### parseMatchExpression

**Signature**: `private parseMatchExpression(): Expression`

##### getOperatorPrecedence

**Signature**: `private getOperatorPrecedence(operator: string): number`

##### getOperatorToken

**Signature**: `private getOperatorToken(operator: string): number`

##### parseArrayLiteral

**Signature**: `private parseArrayLiteral(): Expression`

##### parseObjectLiteral

**Signature**: `private parseObjectLiteral(): Expression`

##### getCurrentOperator

**Signature**: `private getCurrentOperator(): string`

##### isUnaryOperator

**Signature**: `private isUnaryOperator(type: number): boolean`

##### functionDeclaration

Parses a function declaration with optional generic parameters.

**Signature**: `functionDeclaration(isAsync: boolean = false): FunctionDeclaration`

##### parseGenericParameters

Parses generic type parameters with optional constraints.
Example: <T extends number, U = string>

**Signature**: `private parseGenericParameters(): GenericParameter[]`

##### parseTypeReference

Parses a type reference, including generics and union types.
Examples:
- number
- Array<T>
- string | null

**Signature**: `private parseTypeReference(): TypeReference`

##### parameterList

**Signature**: `private parameterList(): any[]`

##### block

**Signature**: `private block(): any[]`

##### returnStatement

**Signature**: `private returnStatement(): ReturnStatement`

##### ifStatement

**Signature**: `private ifStatement(): IfStatement`

##### classDeclaration

**Signature**: `private classDeclaration(decorators: any[] = []): any`

##### parseMethodParams

**Signature**: `private parseMethodParams(): any[]`

##### whileStatement

**Signature**: `private whileStatement(): WhileStatement`

##### forStatement

**Signature**: `private forStatement(): ForStatement`

##### throwStatement

**Signature**: `private throwStatement(): ThrowStatement`

##### tryStatement

**Signature**: `private tryStatement(): TryStatement`

**Example**:

```typescript
* ```typescript
 // Parse a generic function
 fn map<T, U>(items: T[], fn: (item: T) => U): U[] {
   return items.map(fn);
 }
 
 // Parse a decorated class with generic constraint
```


