# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [reactive](#reactive)
- [binding](#binding)
- [errors](#errors)
- [types](#types)
- [OmniscriptParser](#omniscriptparser)
- [OmniscriptLexer](#omniscriptlexer)
- [parser](#parser)
- [debug](#debug)
- [optimizer](#optimizer)
- [aot](#aot)
- [compiler](#compiler)
- [simd](#simd)
- [memory-pool](#memory-pool)
- [security](#security)
- [runtime](#runtime)
- [lexer](#lexer)
- [ast](#ast)
- [parser](#parser)
- [eval](#eval)
- [docs-generator](#docs-generator)
- [src](#src)
- [package-manager](#package-manager)
- [fuzzer](#fuzzer)
- [docs-site](#docs-site)
- [cli](#cli)
- [installManager](#installmanager)
- [types](#types)
- [concurrency](#concurrency)
- [metaprogramming](#metaprogramming)
- [pattern-matching](#pattern-matching)
- [actor](#actor)
- [event-sourcing](#event-sourcing)
- [optimizer](#optimizer)
- [ssr](#ssr)
- [math](#math)
- [ai](#ai)
- [async](#async)
- [datetime](#datetime)
- [logging](#logging)
- [audio](#audio)
- [cache](#cache)
- [collections](#collections)
- [validation](#validation)
- [serialization](#serialization)
- [config](#config)
- [crypto](#crypto)
- [encoding](#encoding)
- [fs](#fs)
- [genetic](#genetic)
- [graphics](#graphics)
- [io](#io)
- [network](#network)
- [threading](#threading)
- [client](#client)
- [server](#server)
- [connections](#connections)
- [decorators](#decorators)
- [query-builder](#query-builder)
- [media-errors](#media-errors)
- [media-validator](#media-validator)
- [key-manager](#key-manager)
- [performance-monitor](#performance-monitor)
- [media](#media)
- [json](#json)
- [regex](#regex)
- [path](#path)
- [string](#string)
- [url](#url)
- [random](#random)
- [tuple](#tuple)
- [stdlib](#stdlib)
- [reactive](#reactive)
- [type-checker](#type-checker)

## reactive

**File**: `/home/runner/work/Omniscript/Omniscript/src/reactive.ts`

### Classes

#### Stream

**Properties**:

- `subscribers: ((value: T) => void)[]` - 

**Methods**:

##### subscribe

**Signature**: `subscribe(fn: (value: T) => void): () => void`

##### next

**Signature**: `next(value: T): void`

##### complete

**Signature**: `complete(): void`

#### Observable

**Methods**:

##### subscribe

**Signature**: `subscribe(fn: (value: T) => void): () => void`

#### Signal

**Properties**:

- `_value: T` - 
- `subscribers: ((newValue: T) => void)[]` - 

**Methods**:

##### subscribe

**Signature**: `subscribe(fn: (newVal: T) => void): () => void`


## binding

**File**: `src/binding.ts`

### Classes

#### DataBinder


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


## types

**File**: `/home/runner/work/Omniscript/Omniscript/src/parser/types.ts`

### Interfaces

#### Token

Represents a token produced by the lexer.
Tokens serve as the basic units inserted into the parser.

**Properties**:

- `text: string` - 
- `type: number` - 
- `line: number` - 
- `column: number` - 

#### ParserInput

Represents an input stream for the parser.
Provides facilities for looking ahead and retrieving tokens.

**Methods**:

##### LA

Look ahead by the given offset.

**Signature**: `LA(offset: number): number;`

##### LT

Get the token at the given lookahead offset.

**Signature**: `LT(offset: number): Token;`

#### ASTNode

Base interface for all nodes in the Abstract Syntax Tree (AST).

**Properties**:

- `type: string` - 
- `line: number` - 
- `column: number` - 
- `subject: Expression` - 
- `arms: MatchArm[]` - 

#### MatchArm

Represents a match arm in a match expression.

**Properties**:

- `pattern: Expression` - 
- `body: Statement[]` - 

#### Program

Represents the root of the AST, corresponding to an entire program.

**Extends**: `ASTNode`

**Properties**:

- `type: 'Program'` - 
- `body: Statement[]` - 

#### Statement

Represents a statement node in the AST.
A statement can be a variable declaration, function declaration, decorator, or expression.

**Extends**: `ASTNode`

**Properties**:

- `type: 'VariableDeclaration' | 'FunctionDeclaration' | 'Decorator' | 'Expression' | 'ReturnStatement' | 'IfStatement' | 'WhileStatement' | 'ForStatement' | 'ThrowStatement' | 'TryStatement' | 'ClassDeclaration'` - 

#### Expression

Represents an expression node in the AST.

**Extends**: `ASTNode`

**Properties**:

- `type: 'Expression'` - 
- `kind: ExpressionKind` - 
- `operator: Operator | '??='` - 
- `left: Expression` - 
- `right: Expression` - 
- `value: string | number | boolean | null` - The literal value of the expression.
Allowed types: string, number, boolean, or null.
- `name: string` - 
- `arguments: Expression[]` - 
- `object: Expression` - 
- `member: string` - 
- `elements: Expression[]` - 
- `properties: { key: string; value: Expression }[]` - 
- `callee: Expression` - 
- `condition: Expression` - 
- `trueExpr: Expression` - 
- `falseExpr: Expression` - 
- `subject: Expression` - 
- `matchArms: { pattern: { kind: 'Wildcard' } | { kind: 'Identifier'; name: string } | { kind: 'Number'; value: number }; guard?: Expression; value: Expression }[]` - 
- `parts: (Expression | string)[]` - 
- `expressions: Expression[]` - 

#### VariableDeclaration

Represents a variable declaration statement.

**Extends**: `Statement`

**Properties**:

- `type: 'VariableDeclaration'` - 
- `name: string` - 
- `varType: string | null` - 
- `initializer: Expression | null` - 

#### Decorator

Represents a decorator applied to a declaration.
Decorators can modify or annotate classes, methods, or properties.

**Extends**: `Statement`

**Properties**:

- `type: 'Decorator'` - 
- `name: string` - 
- `arguments: Expression[] | null` - 
- `meta: Record<string, any>` - 

#### ASTError

Interface for representing errors or diagnostic messages in the AST.
Useful during parsing and type checking for reporting malformed syntax.

**Properties**:

- `message: string` - 
- `line: number` - 
- `column: number` - 
- `details: string` - 
- `errorCode: string` - 
- `suggestions: string[]` - 
- `source: string` - 

#### FunctionDeclaration

Represents a function declaration in the AST.
Supports generic type parameters and async functions.

**Extends**: `Statement`

**Properties**:

- `type: 'FunctionDeclaration'` - 
- `name: string` - 
- `generics: GenericParameter[]` - 
- `params: Parameter[]` - 
- `returnType: TypeReference` - 
- `body: Statement[]` - 
- `isAsync: boolean` - 
- `decorators: Decorator[]` - 

#### MethodDeclaration

**Properties**:

- `type: 'MethodDeclaration'` - 
- `name: string` - 
- `params: Parameter[]` - 
- `returnType: TypeReference` - 
- `body: Statement[]` - 
- `isAsync: boolean` - 
- `isOperator: boolean` - 
- `operatorSymbol: string` - 
- `decorators: Decorator[]` - 

#### ClassDeclaration

**Extends**: `Statement`

**Properties**:

- `type: 'ClassDeclaration'` - 
- `name: string` - 
- `methods: MethodDeclaration[]` - 
- `decorators: Decorator[]` - 

#### ReturnStatement

**Extends**: `Statement`

**Properties**:

- `type: 'ReturnStatement'` - 
- `argument: Expression | null` - 

#### IfStatement

**Extends**: `Statement`

**Properties**:

- `type: 'IfStatement'` - 
- `condition: Expression` - 
- `thenBody: Statement[]` - 
- `elseBody: Statement[]` - 

#### WhileStatement

**Extends**: `Statement`

**Properties**:

- `type: 'WhileStatement'` - 
- `condition: Expression` - 
- `body: Statement[]` - 

#### ForStatement

**Extends**: `Statement`

**Properties**:

- `type: 'ForStatement'` - 
- `init: Statement | null` - 
- `condition: Expression | null` - 
- `update: Expression | null` - 
- `body: Statement[]` - 

#### ThrowStatement

**Extends**: `Statement`

**Properties**:

- `type: 'ThrowStatement'` - 
- `argument: Expression` - 

#### TryStatement

**Extends**: `Statement`

**Properties**:

- `type: 'TryStatement'` - 
- `tryBlock: Statement[]` - 
- `catchVar: string` - 
- `catchBlock: Statement[]` - 
- `finallyBlock: Statement[]` - 

#### GenericParameter

Represents a generic type parameter with optional constraints.

**Properties**:

- `name: string` - 
- `constraint: TypeReference` - 
- `default: TypeReference` - 

#### Parameter

Represents a parameter in a function declaration.

**Properties**:

- `name: string` - 
- `type: TypeReference` - 
- `optional: boolean` - 
- `defaultValue: Expression` - 

#### TypeReference

Represents a type reference which can be a simple type name
or a complex generic type with type arguments.

**Properties**:

- `name: string` - 
- `typeArguments: TypeReference[]` - 
- `isArray: boolean` - 
- `isUnion: boolean` - 
- `unionTypes: TypeReference[]` - 


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


## OmniscriptLexer

**File**: `/home/runner/work/Omniscript/Omniscript/src/parser/OmniscriptLexer.ts`

### Classes

#### OmniscriptLexer

**Extends**: `Lexer`

**Properties**:

- `EOF: any` - 
- `_tokenStartLine: number` - 
- `_tokenStartColumn: number` - 
- `_tokenStartCharIndex: number` - 

**Methods**:

##### nextToken

**Signature**: `nextToken(): any`

##### makeToken

**Signature**: `private makeToken(type: number, text: string): any`


## parser

**File**: `/home/runner/work/Omniscript/Omniscript/src/parser/index.ts`

### Classes

#### Parser

**Methods**:

##### parse

**Signature**: `parse(source: string)`

##### hasMatchExpressions

**Signature**: `private hasMatchExpressions(ast: any): boolean`

##### parsePatternMatching

**Signature**: `parsePatternMatching(node: ASTNode): any`

##### parseMatchArm

**Signature**: `private parseMatchArm(arm: any): any`

##### parsePattern

**Signature**: `private parsePattern(pattern: any): any`

##### parseMatchExpression

**Signature**: `private parseMatchExpression(node: ASTNode): any`

##### fallbackParse

**Signature**: `private fallbackParse(source: string): any`

##### parseSimpleStatement

**Signature**: `private parseSimpleStatement(src: string): any`

##### parseMethodCallStatement

**Signature**: `private parseMethodCallStatement(stmt: string, body: any[]): void`

##### parseLetStatement

**Signature**: `private parseLetStatement(stmt: string, body: any[]): void`

##### parseClassStatement

**Signature**: `private parseClassStatement(stmt: string, body: any[]): void`

##### parseExpressionStatement

**Signature**: `private parseExpressionStatement(stmt: string, body: any[]): void`

##### parseArguments

**Signature**: `private parseArguments(argsStr: string): any[]`

##### smartSplit

**Signature**: `private smartSplit(str: string, delimiter: string): string[]`

##### parseObjectLiteral

**Signature**: `private parseObjectLiteral(objStr: string): any`

##### parseArrayLiteral

**Signature**: `private parseArrayLiteral(arrStr: string): any`

##### parseBinaryExpression

**Signature**: `private parseBinaryExpression(expr: string): any`

##### parseSimpleExpression

**Signature**: `private parseSimpleExpression(expr: string): any`

##### parseTemplateLiteral

**Signature**: `private parseTemplateLiteral(templateStr: string): any`

##### parseExpression

**Signature**: `private parseExpression(expr: string): any`


## debug

**File**: `/home/runner/work/Omniscript/Omniscript/src/debug/index.ts`

### Classes

#### DebugLogger

**Properties**:

- `instance: DebugLogger` - 
- `debugLevel: DebugLevel` - 
- `enabledComponents: Set<string>` - 

**Methods**:

##### getInstance

**Signature**: `static getInstance(): DebugLogger`

##### setLevel

**Signature**: `setLevel(level: DebugLevel): void`

##### enableComponent

**Signature**: `enableComponent(component: string): void`

##### disableComponent

**Signature**: `disableComponent(component: string): void`

##### enableAllComponents

**Signature**: `enableAllComponents(): void`

##### isEnabled

**Signature**: `isEnabled(component: string, level: DebugLevel): boolean`

##### error

**Signature**: `error(component: string, message: string, ...args: any[]): void`

##### warn

**Signature**: `warn(component: string, message: string, ...args: any[]): void`

##### info

**Signature**: `info(component: string, message: string, ...args: any[]): void`

##### debug

**Signature**: `debug(component: string, message: string, ...args: any[]): void`

##### trace

**Signature**: `trace(component: string, message: string, ...args: any[]): void`

##### time

**Signature**: `time(component: string, label: string): void`

##### timeEnd

**Signature**: `timeEnd(component: string, label: string): void`

### Functions

#### enableDebugger

**Signature**: `export function enableDebugger(): void`

#### enableComponentDebug

**Signature**: `export function enableComponentDebug(component: string, level: DebugLevel = DebugLevel.DEBUG): void`

#### configureDebugFromEnv

**Signature**: `export function configureDebugFromEnv(): void`


## optimizer

**File**: `/home/runner/work/Omniscript/Omniscript/src/compiler/optimizer.ts`

### Classes

#### ConstantFoldingPass

**Implements**: `OptimizationPass`

**Properties**:

- `name: any` - 

**Methods**:

##### optimize

**Signature**: `optimize(bytecode: any): any`

##### foldConstants

**Signature**: `private foldConstants(node: any): any`

#### DeadCodeEliminationPass

**Implements**: `OptimizationPass`

**Properties**:

- `name: any` - 

**Methods**:

##### optimize

**Signature**: `optimize(bytecode: any): any`

##### eliminateDeadCode

**Signature**: `private eliminateDeadCode(node: any): any`

#### InliningPass

**Implements**: `OptimizationPass`

**Properties**:

- `name: any` - 
- `inlineThreshold: any` - 

**Methods**:

##### optimize

**Signature**: `optimize(bytecode: any): any`

##### performInlining

**Signature**: `private performInlining(node: any): any`

#### JITOptimizer

**Properties**:

- `passes: OptimizationPass[]` - 
- `fastMode: any` - 

**Methods**:

##### optimize

**Signature**: `optimize(bytecode: any): any`

##### fastOptimize

**Signature**: `fastOptimize(bytecode: any): any`

##### addPass

**Signature**: `addPass(pass: OptimizationPass): void`

##### removePass

**Signature**: `removePass(passName: string): void`

### Interfaces

#### OptimizationPass

**Properties**:

- `name: string` - 

**Methods**:

##### optimize

**Signature**: `optimize(bytecode: any): any;`


## aot

**File**: `/home/runner/work/Omniscript/Omniscript/src/compiler/aot.ts`

### Classes

#### AOTCompiler

Ahead-of-Time compiler for direct machine code generation
Bypasses TypeScript->JavaScript compilation and generates optimized bytecode directly

**Properties**:

- `options: AOTCompilerOptions` - 

**Methods**:

##### compileToMachineCode

Compile AST directly to optimized machine code representation
This skips all intermediate representations for maximum speed

**Signature**: `compileToMachineCode(ast: any): any`

##### compileUnoptimized

**Signature**: `private compileUnoptimized(ast: any): any`

##### compileBasicOptimization

**Signature**: `private compileBasicOptimization(ast: any): any`

##### compileStandardOptimization

**Signature**: `private compileStandardOptimization(ast: any): any`

##### compileAggressiveOptimization

**Signature**: `private compileAggressiveOptimization(ast: any): any`

##### directTranslate

**Signature**: `private directTranslate(node: any): any`

##### applyConstantFolding

**Signature**: `private applyConstantFolding(bytecode: any): any`

##### applyBasicInlining

**Signature**: `private applyBasicInlining(bytecode: any): any`

##### applyAdvancedInlining

**Signature**: `private applyAdvancedInlining(bytecode: any): any`

##### applyDeadCodeElimination

**Signature**: `private applyDeadCodeElimination(bytecode: any): any`

##### applyLoopOptimizations

**Signature**: `private applyLoopOptimizations(bytecode: any): any`

### Interfaces

#### AOTCompilerOptions

**Properties**:

- `target: 'bytecode' | 'native'` - 
- `optimizationLevel: 0 | 1 | 2 | 3` - 
- `enableInlining: boolean` - 


## compiler

**File**: `/home/runner/work/Omniscript/Omniscript/src/compiler/index.ts`

### Classes

#### Compiler

**Properties**:

- `jitOptimizer: JITOptimizer` - 
- `aotCompiler: AOTCompiler` - 
- `compilationCache: any` - 
- `options: CompilerOptions` - 

**Methods**:

##### compile

**Signature**: `compile(ast: any): any`

##### fastCompile

**Signature**: `fastCompile(ast: any): any`

##### generateASTHash

**Signature**: `private generateASTHash(ast: any): string`

##### performTypeChecking

**Signature**: `private performTypeChecking(ast: any): void`

##### checkNodeForTypeErrors

**Signature**: `private checkNodeForTypeErrors(node: any): void`

##### checkForTypeErrors

**Signature**: `private checkForTypeErrors(fnNode: any): boolean`

##### hasAdditionOperation

**Signature**: `private hasAdditionOperation(body: any): boolean`

##### visitNode

**Signature**: `private visitNode(node: any): any`

##### visitBlock

**Signature**: `private visitBlock(node: any): any`

##### visitProgram

**Signature**: `private visitProgram(node: any): any`

##### containsBinaryAddBetweenParams

**Signature**: `private containsBinaryAddBetweenParams(fnNode: any): boolean`

##### visitFunctionDeclaration

**Signature**: `private visitFunctionDeclaration(node: any): any`

##### visitReturnStatement

**Signature**: `private visitReturnStatement(node: any): any`

##### visitExpressionStatement

**Signature**: `private visitExpressionStatement(node: any): any`

##### visitVariableDeclaration

**Signature**: `private visitVariableDeclaration(node: any): any`

##### visitIfStatement

**Signature**: `private visitIfStatement(node: any): any`

##### visitWhileStatement

**Signature**: `private visitWhileStatement(node: any): any`

##### visitForStatement

**Signature**: `private visitForStatement(node: any): any`

##### visitThrowStatement

**Signature**: `private visitThrowStatement(node: any): any`

##### visitTryStatement

**Signature**: `private visitTryStatement(node: any): any`

##### visitConditionalType

**Signature**: `private visitConditionalType(node: any): any`

##### visitIntersectionType

**Signature**: `private visitIntersectionType(node: any): any`

##### visitMacro

**Signature**: `private visitMacro(node: any): any`

##### visitClassDeclaration

**Signature**: `private visitClassDeclaration(node: any): any`

##### visitMatch

**Signature**: `private visitMatch(node: any): any`

##### expandMacro

**Signature**: `private expandMacro(node: any): any`

##### visitImportDeclaration

**Signature**: `private visitImportDeclaration(node: any): any`

##### visitFunction

**Signature**: `private visitFunction(node: any): any`

##### visitClass

**Signature**: `private visitClass(node: any): any`

### Interfaces

#### CompilerOptions

**Properties**:

- `fastMode: boolean` - 
- `skipTypeChecking: boolean` - 
- `skipOptimization: boolean` - 
- `enableCaching: boolean` - 
- `useAOT: boolean` - 
- `aotOptions: AOTCompilerOptions` - 

### Functions

#### scan

**Signature**: `function scan(nodes: any[]): boolean`


## simd

**File**: `/home/runner/work/Omniscript/Omniscript/src/runtime/simd.ts`

### Classes

#### SIMDProcessor

**Implements**: `SIMDOperations`

**Properties**:

- `useParallel: boolean` - 

**Methods**:

##### enableParallelExecution

**Signature**: `enableParallelExecution(): void`

##### add

**Signature**: `add(a: number[], b: number[]): number[]`

##### subtract

**Signature**: `subtract(a: number[], b: number[]): number[]`

##### multiply

**Signature**: `multiply(a: number[], b: number[]): number[]`

##### divide

**Signature**: `divide(a: number[], b: number[]): number[]`

##### dot

**Signature**: `dot(a: number[], b: number[]): number`

##### magnitude

**Signature**: `magnitude(a: number[]): number`

##### normalize

**Signature**: `normalize(a: number[]): number[]`

##### matrixMultiply

**Signature**: `matrixMultiply(a: number[][], b: number[][]): number[][]`

##### parallelOperation

**Signature**: `private parallelOperation(a: number[], b: number[], op: (x: number, y: number) => number): number[]`

##### parallelReduce

**Signature**: `private parallelReduce(
    a: number[], 
    b: number[], 
    op: (x: number, y: number) => number,
    reducer: (acc: number, val: number) => number,
    initial: number
  ): number`

##### processChunk

**Signature**: `private async processChunk(a: number[], b: number[], op: (x: number, y: number) => number): Promise<number[]>`

##### processUnaryChunk

**Signature**: `private async processUnaryChunk(a: number[], op: (x: number) => number): Promise<number[]>`

##### validateArrays

**Signature**: `private validateArrays(a: number[], b: number[]): void`

##### fma

**Signature**: `fma(a: number[], b: number[], c: number[]): number[]`

##### reduce

**Signature**: `reduce(a: number[], operation: 'sum' | 'min' | 'max' | 'mean'): number`

##### transform

**Signature**: `transform(a: number[], fn: (x: number) => number): number[]`

##### convolve

**Signature**: `convolve(signal: number[], kernel: number[]): number[]`

##### crossCorrelation

**Signature**: `crossCorrelation(a: number[], b: number[]): number[]`

##### mean

**Signature**: `mean(a: number[]): number`

##### variance

**Signature**: `variance(a: number[]): number`

##### standardDeviation

**Signature**: `standardDeviation(a: number[]): number`

##### covariance

**Signature**: `covariance(a: number[], b: number[]): number`

##### correlation

**Signature**: `correlation(a: number[], b: number[]): number`

##### parallelUnaryOperation

**Signature**: `private parallelUnaryOperation(a: number[], op: (x: number) => number): number[]`

### Interfaces

#### SIMDOperations

**Methods**:

##### add

**Signature**: `add(a: number[], b: number[]): number[];`

##### subtract

**Signature**: `subtract(a: number[], b: number[]): number[];`

##### multiply

**Signature**: `multiply(a: number[], b: number[]): number[];`

##### divide

**Signature**: `divide(a: number[], b: number[]): number[];`

##### dot

**Signature**: `dot(a: number[], b: number[]): number;`

##### magnitude

**Signature**: `magnitude(a: number[]): number;`

##### normalize

**Signature**: `normalize(a: number[]): number[];`

##### fma

**Signature**: `fma(a: number[], b: number[], c: number[]): number[];`

##### reduce

**Signature**: `reduce(a: number[], operation: 'sum' | 'min' | 'max' | 'mean'): number;`

##### transform

**Signature**: `transform(a: number[], fn: (x: number) => number): number[];`

##### convolve

**Signature**: `convolve(signal: number[], kernel: number[]): number[];`

##### crossCorrelation

**Signature**: `crossCorrelation(a: number[], b: number[]): number[];`

##### mean

**Signature**: `mean(a: number[]): number;`

##### variance

**Signature**: `variance(a: number[]): number;`

##### standardDeviation

**Signature**: `standardDeviation(a: number[]): number;`

##### covariance

**Signature**: `covariance(a: number[], b: number[]): number;`

##### correlation

**Signature**: `correlation(a: number[], b: number[]): number;`


## memory-pool

**File**: `/home/runner/work/Omniscript/Omniscript/src/runtime/memory-pool.ts`

### Classes

#### MemoryPool

**Properties**:

- `pool: T[]` - 
- `allocated: Set<T>` - 
- `options: Required<MemoryPoolOptions>` - 
- `totalAllocated: any` - 
- `totalReleased: any` - 

**Methods**:

##### initialize

**Signature**: `private initialize(): void`

##### createObject

**Signature**: `private createObject(): T`

##### allocate

**Signature**: `allocate(size?: number): T`

##### release

**Signature**: `release(object: T): void`

##### clear

**Signature**: `clear(): void`

##### getStats

**Signature**: `getStats()`

##### getTotalSize

**Signature**: `private getTotalSize(): number`

##### grow

**Signature**: `private grow(): void`

#### MemoryPoolManager

**Properties**:

- `pools: Map<string, MemoryPool>` - 

**Methods**:

##### createPool

**Signature**: `createPool<T>(name: string, options: MemoryPoolOptions): MemoryPool<T>`

##### getPool

**Signature**: `getPool(name: string): MemoryPool | undefined`

##### removePool

**Signature**: `removePool(name: string): void`

##### getAllStats

**Signature**: `getAllStats()`

##### clearAll

**Signature**: `clearAll(): void`

### Interfaces

#### MemoryPoolOptions

**Properties**:

- `initialSize: number` - 
- `maxSize: number` - 
- `objectType: any` - 
- `growthFactor: number` - 


## security

**File**: `/home/runner/work/Omniscript/Omniscript/src/security/index.ts`

### Classes

#### SecurityManager

**Properties**:

- `instance: SecurityManager` - 
- `defaultPolicy: SecurityPolicy` - 
- `auditLog: Array<{
    timestamp: number;
    action: string;
    allowed: boolean;
    context: any;
  }>` - 

**Methods**:

##### getInstance

**Signature**: `static getInstance(): SecurityManager`

##### createSandbox

**Signature**: `createSandbox(policy?: Partial<SecurityPolicy>): SandboxedEnvironment`

##### checkResourceAccess

**Signature**: `checkResourceAccess(action: string, resource: string, context: ExecutionContext): boolean`

##### evaluateAccess

**Signature**: `private evaluateAccess(action: string, resource: string, context: ExecutionContext): boolean`

##### checkModuleAccess

**Signature**: `private checkModuleAccess(moduleName: string, policy: SecurityPolicy): boolean`

##### logAction

**Signature**: `private logAction(action: string, allowed: boolean, context: any): void`

##### sanitizeContext

**Signature**: `private sanitizeContext(context: ExecutionContext): any`

##### getAuditLog

**Signature**: `getAuditLog(since?: number): Array<any>`

##### clearAuditLog

**Signature**: `clearAuditLog(): void`

#### SandboxedEnvironment

**Properties**:

- `context: ExecutionContext` - 
- `originalConsole: Console` - 
- `sandboxedGlobals: any` - 

**Methods**:

##### setupSandboxedEnvironment

**Signature**: `private setupSandboxedEnvironment(): void`

##### createSandboxedConsole

**Signature**: `private createSandboxedConsole(): Console`

##### createRestrictedFunction

**Signature**: `private createRestrictedFunction(name: string): Function`

##### createRestrictedRequire

**Signature**: `private createRestrictedRequire(): Function`

##### createRestrictedImport

**Signature**: `private createRestrictedImport(): Function`

##### execute

**Signature**: `execute(code: string): Promise<any>`

##### checkExecutionLimits

**Signature**: `private checkExecutionLimits(): void`

##### executeInIsolation

**Signature**: `private executeInIsolation(code: string): any`

##### getResourceUsage

**Signature**: `getResourceUsage():`

##### destroy

**Signature**: `destroy(): void`

#### SecurityError

**Extends**: `OmniscriptError`

#### ResourceLimitExceededError

**Extends**: `SecurityError`

#### ResourceMonitor

**Properties**:

- `intervals: Map<string, NodeJS.Timeout>` - 

**Methods**:

##### startMonitoring

**Signature**: `static startMonitoring(name: string, limits: ResourceLimits, callback: (usage: any) => void): void`

##### stopMonitoring

**Signature**: `static stopMonitoring(name: string): void`

##### getCurrentUsage

**Signature**: `private static getCurrentUsage(): any`

### Interfaces

#### SecurityPolicy

**Properties**:

- `allowFileSystem: boolean` - 
- `allowNetwork: boolean` - 
- `allowProcessExecution: boolean` - 
- `maxMemoryMB: number` - 
- `maxExecutionTimeMs: number` - 
- `maxCallStackDepth: number` - 
- `allowedModules: string[]` - 
- `deniedFunctions: string[]` - 

#### ResourceLimits

**Properties**:

- `maxMemoryBytes: number` - 
- `maxCpuTimeMs: number` - 
- `maxFileDescriptors: number` - 
- `maxNetworkConnections: number` - 

#### ExecutionContext

**Properties**:

- `policy: SecurityPolicy` - 
- `startTime: number` - 
- `memoryUsage: number` - 
- `callStackDepth: number` - 
- `openFileDescriptors: Set<string>` - 
- `networkConnections: Set<string>` - 


## runtime

**File**: `/home/runner/work/Omniscript/Omniscript/src/runtime/index.ts`

### Classes

#### Result

**Methods**:

##### Ok

**Signature**: `static Ok<T, E>(value: T): Result<T, E>`

##### Err

**Signature**: `static Err<T, E>(error: E): Result<T, E>`

##### isOk

**Signature**: `isOk(): boolean`

##### isErr

**Signature**: `isErr(): boolean`

##### unwrap

**Signature**: `unwrap(): T`

##### unwrapErr

**Signature**: `unwrapErr(): E`

#### Runtime

**Properties**:

- `scope: Map<string, unknown>` - 
- `referenceCounts: Map<object, number>` - 
- `weakReferences: WeakMap<object, boolean>` - 
- `debugMode: boolean` - 
- `envStack: Array<Map<string, unknown>>` - 
- `simdProcessor: SIMDProcessor` - 
- `memoryPoolManager: MemoryPoolManager` - 

**Methods**:

##### operatorOverloadingExample

**Signature**: `public operatorOverloadingExample(): void`

##### addVectors

**Signature**: `public addVectors(v1:`

##### executeClassDeclaration

**Signature**: `private executeClassDeclaration(node:`

##### execute

**Signature**: `execute(bytecode: Bytecode): unknown`

##### executeAsync

**Signature**: `async executeAsync(bytecode: Bytecode): Promise<unknown>`

##### executeFunction

**Signature**: `private executeFunction(fn: Bytecode): unknown`

##### executeFunctionAsync

**Signature**: `private async executeFunctionAsync(fn: Bytecode): Promise<unknown>`

##### executeReturn

**Signature**: `private executeReturn(ret: Bytecode): unknown`

##### executeReturnAsync

**Signature**: `private async executeReturnAsync(ret: Bytecode): Promise<unknown>`

##### enableParallelExecution

**Signature**: `enableParallelExecution(debug = false): void`

##### initializeDefaultPools

**Signature**: `private initializeDefaultPools(): void`

##### initializeStdlibGlobals

**Signature**: `private initializeStdlibGlobals(): void`

##### simdAdd

**Signature**: `public simdAdd(a: number[], b: number[]): number[]`

##### simdSubtract

**Signature**: `public simdSubtract(a: number[], b: number[]): number[]`

##### simdMultiply

**Signature**: `public simdMultiply(a: number[], b: number[]): number[]`

##### simdDivide

**Signature**: `public simdDivide(a: number[], b: number[]): number[]`

##### simdDot

**Signature**: `public simdDot(a: number[], b: number[]): number`

##### simdMagnitude

**Signature**: `public simdMagnitude(a: number[]): number`

##### simdNormalize

**Signature**: `public simdNormalize(a: number[]): number[]`

##### matrixMultiply

**Signature**: `public matrixMultiply(a: number[][], b: number[][]): number[][]`

##### createMemoryPool

**Signature**: `public createMemoryPool(name: string, initialSize: number, maxSize: number, objectType?: any)`

##### getMemoryPool

**Signature**: `public getMemoryPool(name: string)`

##### getMemoryPoolStats

**Signature**: `public getMemoryPoolStats()`

##### allocate

**Signature**: `allocate(object: object): void`

##### release

**Signature**: `release(object: object): void`

##### cleanup

**Signature**: `private cleanup(object: object): void`

##### enableGarbageCollection

**Signature**: `enableGarbageCollection(debug = false): void`

##### getMemoryUsage

**Signature**: `public getMemoryUsage():`

##### runGarbageCollector

**Signature**: `public runGarbageCollector(): void`

##### detectCircularReferences

**Signature**: `detectCircularReferences(): void`

##### traverseReferences

**Signature**: `private traverseReferences(object: any, visited: Set<any>, stack: Set<any>): boolean`

##### createActor

**Signature**: `createActor<TState>(actorFn: (message: any, state: TState) => TState | Promise<TState>, initialState: TState): Actor<TState>`

##### scheduleCoroutine

**Signature**: `async scheduleCoroutine(coroutine: () => Promise<any>): Promise<any>`

##### enableDebugMode

**Signature**: `enableDebugMode(): void`

##### enableMemoryManagement

**Signature**: `enableMemoryManagement(): void`

##### getReferenceCounts

**Signature**: `public getReferenceCounts(): Map<object, number>`

##### pushEnv

**Signature**: `private pushEnv()`

##### popEnv

**Signature**: `private popEnv()`

##### setVar

**Signature**: `public setVar(name: string, value: unknown)`

##### getVar

**Signature**: `public getVar(name: string): unknown`

##### executeBlock

**Signature**: `private executeBlock(stmts: Bytecode[]): unknown`

##### executeVarDecl

**Signature**: `private executeVarDecl(node:`

##### executeExpressionStatement

**Signature**: `private executeExpressionStatement(node:`

##### executeIf

**Signature**: `private executeIf(node:`

##### executeWhile

**Signature**: `private executeWhile(node:`

##### executeFor

**Signature**: `private executeFor(node:`

##### executeThrow

**Signature**: `private executeThrow(node:`

##### executeTry

**Signature**: `private executeTry(node:`

##### executeMatch

**Signature**: `private executeMatch(node: any): unknown`

##### evalExpr

**Signature**: `private evalExpr(expr: Bytecode |`

##### evalMatch

**Signature**: `private evalMatch(expr:`

##### evalTemplateLiteral

**Signature**: `private evalTemplateLiteral(expr:`

##### matchPattern

**Signature**: `private matchPattern(value: unknown, pattern:`

##### executeImport

**Signature**: `private executeImport(node:`

##### loadOmniscriptStdlib

**Signature**: `private loadOmniscriptStdlib(): any`

##### executeOmniscriptModule

**Signature**: `private executeOmniscriptModule(source: string, moduleName: string): any`

##### evalUnary

**Signature**: `private evalUnary(expr:`

##### evalBinary

**Signature**: `private evalBinary(expr:`

##### evalAssign

**Signature**: `private evalAssign(left:`

##### createLambdaEnv

**Signature**: `private createLambdaEnv(closure: any, params: string[], args: unknown[]): Map<string, unknown>`

##### executeLambdaBody

**Signature**: `private executeLambdaBody(body: any, env: Map<string, unknown>): unknown`

##### createSecureSandbox

**Signature**: `createSecureSandbox(policy?: Partial<SecurityPolicy>): SandboxedEnvironment`

##### executeSecure

**Signature**: `async executeSecure(code: string, policy?: Partial<SecurityPolicy>): Promise<any>`

##### getSecurityAuditLog

**Signature**: `getSecurityAuditLog(since?: number): Array<any>`

##### clearSecurityAuditLog

**Signature**: `clearSecurityAuditLog(): void`

##### executeBinary

**Signature**: `private executeBinary(node: any): unknown`

##### executeIdentifier

**Signature**: `private executeIdentifier(node: any): unknown`

#### Actor

**Properties**:

- `mailbox: unknown[]` - 
- `busy: any` - 

**Methods**:

##### send

**Signature**: `send(message: unknown): void`

##### schedule

**Signature**: `private async schedule(): Promise<void>`

#### Coroutine

**Properties**:

- `generator: Generator` - 

**Methods**:

##### run

**Signature**: `async run(): Promise<void>`

### Interfaces

#### Bytecode

**Properties**:

- `type: string` - 
- `name: string` - 
- `params: string[]` - 
- `body: Bytecode[]` - 
- `value: unknown` - 


## lexer

**File**: `/home/runner/work/Omniscript/Omniscript/src/functional/lexer.ts`

### Interfaces

#### Token

**Properties**:

- `type: string` - 
- `value: string` - 

### Functions

#### lex

**Signature**: `export function lex(input: string): Token[]`


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


## eval

**File**: `/home/runner/work/Omniscript/Omniscript/src/functional/eval.ts`

### Interfaces

#### TailCall

**Properties**:

- `__tag: 'tailcall'` - 
- `fn: LambdaValue` - 
- `args: any[]` - 

### Functions

#### isTailCall

**Signature**: `function isTailCall(value: any): value is TailCall`

#### isSelfRecursiveCall

**Signature**: `function isSelfRecursiveCall(call: Call, fn: LambdaValue, env: Env): boolean`

#### trampoline

**Signature**: `function trampoline(value: any): any`

#### evaluate

**Signature**: `export function evaluate(program: Program): any`

#### evalExpr

**Signature**: `function evalExpr(expr: Expression, env: Env): any`

#### installBuiltins

**Signature**: `function installBuiltins(env: Env)`

#### invoke1

**Signature**: `function invoke1(fn: LambdaValue, a: any)`

#### invoke2

**Signature**: `function invoke2(fn: LambdaValue, a: any, b: any)`

#### createCurriedFunction

**Signature**: `function createCurriedFunction(lambda: Lambda, appliedArgs: any[] = []): any`

#### createPartialFunction

**Signature**: `function createPartialFunction(fn: LambdaValue, partialArgs: (any | undefined)[]): any`

#### createLazyValue

**Signature**: `function createLazyValue(expr: Expression, env: Env): any`

#### createMemoizedFunction

**Signature**: `function createMemoizedFunction(lambda: Lambda): any`


## docs-generator

**File**: `/home/runner/work/Omniscript/Omniscript/src/docs-generator/index.ts`

### Classes

#### TypeScriptDocGenerator

**Properties**:

- `program: ts.Program` - 
- `checker: ts.TypeChecker` - 
- `sourceFiles: ts.SourceFile[]` - 

**Methods**:

##### initializeProgram

**Signature**: `private initializeProgram(): void`

##### generateDocumentation

**Signature**: `generateDocumentation(): APIModule[]`

##### processSourceFile

**Signature**: `private processSourceFile(sourceFile: ts.SourceFile): APIModule`

##### processClass

**Signature**: `private processClass(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): APIClass | null`

##### processInterface

**Signature**: `private processInterface(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile): APIInterface | null`

##### processFunction

**Signature**: `private processFunction(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): APIFunction | null`

##### processMethod

**Signature**: `private processMethod(node: ts.MethodDeclaration, sourceFile: ts.SourceFile): APIMethod | null`

##### processProperty

**Signature**: `private processProperty(node: ts.PropertyDeclaration, sourceFile: ts.SourceFile): APIProperty | null`

##### processMethodSignature

**Signature**: `private processMethodSignature(node: ts.MethodSignature, sourceFile: ts.SourceFile): APIMethod | null`

##### processPropertySignature

**Signature**: `private processPropertySignature(node: ts.PropertySignature, sourceFile: ts.SourceFile): APIProperty | null`

##### extractDocumentation

**Signature**: `private extractDocumentation(node: ts.Node, sourceFile: ts.SourceFile): DocComment`

##### getJSDocComments

**Signature**: `private getJSDocComments(node: ts.Node, sourceFile: ts.SourceFile): string | null`

##### extractDescription

**Signature**: `private extractDescription(jsDoc: string): string`

##### extractParams

**Signature**: `private extractParams(jsDoc: string): Array<`

##### extractReturns

**Signature**: `private extractReturns(jsDoc: string):`

##### extractExample

**Signature**: `private extractExample(jsDoc: string): string | undefined`

##### extractTag

**Signature**: `private extractTag(jsDoc: string, tagName: string): string | undefined`

##### getModuleName

**Signature**: `private getModuleName(sourceFile: ts.SourceFile): string`

##### getExtendsClause

**Signature**: `private getExtendsClause(node: ts.ClassDeclaration): string | undefined`

##### getImplementsClauses

**Signature**: `private getImplementsClauses(node: ts.ClassDeclaration): string[]`

##### getInterfaceExtends

**Signature**: `private getInterfaceExtends(node: ts.InterfaceDeclaration): string[]`

##### getVisibility

**Signature**: `private getVisibility(node: ts.ClassElement): 'public' | 'private' | 'protected'`

##### hasModifier

**Signature**: `private hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean`

##### isExported

**Signature**: `private isExported(node: ts.Node): boolean`

##### getParameters

**Signature**: `private getParameters(parameters: ts.NodeArray<ts.ParameterDeclaration>): Array<`

##### getReturnType

**Signature**: `private getReturnType(node: ts.FunctionLikeDeclaration): string`

##### getTypeString

**Signature**: `private getTypeString(type: ts.TypeNode | undefined): string`

##### getFunctionSignature

**Signature**: `private getFunctionSignature(node: ts.FunctionDeclaration): string`

##### getMethodSignature

**Signature**: `private getMethodSignature(node: ts.MethodDeclaration): string`

##### getMethodSignatureString

**Signature**: `private getMethodSignatureString(node: ts.MethodSignature): string`

##### processExports

**Signature**: `private processExports(node: ts.ExportDeclaration, module: APIModule): void`

#### MarkdownDocGenerator

**Methods**:

##### generateMarkdown

**Signature**: `static generateMarkdown(modules: APIModule[]): string`

##### generateModuleMarkdown

**Signature**: `private static generateModuleMarkdown(module: APIModule): string`

##### generateClassMarkdown

**Signature**: `private static generateClassMarkdown(cls: APIClass): string`

##### generateInterfaceMarkdown

**Signature**: `private static generateInterfaceMarkdown(iface: APIInterface): string`

##### generateFunctionMarkdown

**Signature**: `private static generateFunctionMarkdown(func: APIFunction): string`

##### generateMethodMarkdown

**Signature**: `private static generateMethodMarkdown(method: APIMethod): string`

##### toAnchor

**Signature**: `private static toAnchor(text: string): string`

### Interfaces

#### DocComment

**Properties**:

- `description: string` - 
- `params: Array<{ name: string; type: string; description?: string }>` - 
- `returns: { type: string; description?: string }` - 
- `example: string` - 
- `since: string` - 
- `deprecated: string` - 

#### APIMethod

**Properties**:

- `name: string` - 
- `signature: string` - 
- `visibility: 'public' | 'private' | 'protected'` - 
- `static: boolean` - 
- `async: boolean` - 
- `parameters: Array<{ name: string; type: string; optional: boolean }>` - 
- `returnType: string` - 
- `documentation: DocComment` - 

#### APIProperty

**Properties**:

- `name: string` - 
- `type: string` - 
- `visibility: 'public' | 'private' | 'protected'` - 
- `static: boolean` - 
- `readonly: boolean` - 
- `documentation: DocComment` - 

#### APIClass

**Properties**:

- `name: string` - 
- `extends: string` - 
- `implements: string[]` - 
- `abstract: boolean` - 
- `exported: boolean` - 
- `methods: APIMethod[]` - 
- `properties: APIProperty[]` - 
- `documentation: DocComment` - 

#### APIInterface

**Properties**:

- `name: string` - 
- `extends: string[]` - 
- `exported: boolean` - 
- `methods: APIMethod[]` - 
- `properties: APIProperty[]` - 
- `documentation: DocComment` - 

#### APIFunction

**Properties**:

- `name: string` - 
- `signature: string` - 
- `async: boolean` - 
- `parameters: Array<{ name: string; type: string; optional: boolean }>` - 
- `returnType: string` - 
- `exported: boolean` - 
- `documentation: DocComment` - 

#### APIModule

**Properties**:

- `name: string` - 
- `path: string` - 
- `classes: APIClass[]` - 
- `interfaces: APIInterface[]` - 
- `functions: APIFunction[]` - 
- `exports: string[]` - 


## src

**File**: `/home/runner/work/Omniscript/Omniscript/src/index.ts`

### Classes

#### Omniscript

**Properties**:

- `parser: Parser` - 
- `compiler: Compiler` - 
- `runtime: Runtime` - 

**Methods**:

##### execute

**Signature**: `async execute(source: string): Promise<any>`

### Interfaces

#### OmniscriptOptions

**Properties**:

- `compiler: CompilerOptions` - 
- `fastMode: boolean` - 


## package-manager

**File**: `/home/runner/work/Omniscript/Omniscript/src/package-manager/index.ts`

### Classes

#### PackageManager

**Properties**:

- `config: PackageConfig` - 

**Methods**:

##### loadConfig

**Signature**: `async loadConfig(path: string = 'package.json'): Promise<void>`

##### installDependency

**Signature**: `async installDependency(name: string, version: string): Promise<void>`

##### enableStdLib

**Signature**: `async enableStdLib(module: string): Promise<void>`

##### enableDebugger

**Signature**: `async enableDebugger(): Promise<void>`

##### enableProfiler

**Signature**: `async enableProfiler(): Promise<void>`

##### enableAutocomplete

**Signature**: `async enableAutocomplete(): Promise<void>`

##### enableLinting

**Signature**: `async enableLinting(): Promise<void>`

##### enableRefactoringTools

**Signature**: `async enableRefactoringTools(): Promise<void>`

##### listAvailableLibraries

**Signature**: `async listAvailableLibraries(): Promise<string[]>`

##### listAvailablePlugins

**Signature**: `async listAvailablePlugins(): Promise<string[]>`

##### searchRegistry

**Signature**: `async searchRegistry(query: string): Promise<string[]>`

##### saveConfig

**Signature**: `private async saveConfig(): Promise<void>`

### Interfaces

#### PackageConfig

**Properties**:

- `name: string` - 
- `version: string` - 
- `dependencies: Record<string, string>` - 
- `omniscript: {
    stdlib?: string[];
    plugins?: string[];
  }` - 


## fuzzer

**File**: `/home/runner/work/Omniscript/Omniscript/src/testing/fuzzer.ts`

### Classes

#### Fuzzer

**Properties**:

- `parser: Parser` - 
- `runtime: Runtime` - 
- `config: FuzzingConfig` - 

**Methods**:

##### generateRandomInput

Generate random source code for testing

**Signature**: `private generateRandomInput(): string`

##### generateRandomExpression

**Signature**: `private generateRandomExpression(): string`

##### generateRandomStatement

**Signature**: `private generateRandomStatement(): string`

##### generateRandomClass

**Signature**: `private generateRandomClass(): string`

##### generateRandomFunction

**Signature**: `private generateRandomFunction(): string`

##### generateRandomString

**Signature**: `private generateRandomString(): string`

##### generateRandomSymbols

**Signature**: `private generateRandomSymbols(): string`

##### randomString

**Signature**: `private randomString(maxLength?: number): string`

##### randomIdentifier

**Signature**: `private randomIdentifier(): string`

##### randomNumber

**Signature**: `private randomNumber(): number`

##### randomBoolean

**Signature**: `private randomBoolean(): boolean`

##### testParser

Test parser with random inputs

**Signature**: `private testParser(input: string):`

##### testRuntime

Test runtime with random inputs

**Signature**: `private testRuntime(input: string):`

##### fuzz

Run fuzzing test suite

**Signature**: `async fuzz(): Promise<FuzzingResult>`

##### testProperty

Generate property-based test for specific features

**Signature**: `async testProperty(property: string, iterations: number = 100): Promise<boolean>`

##### testParserNeverHangs

**Signature**: `private async testParserNeverHangs(iterations: number): Promise<boolean>`

##### testRuntimeMemorySafe

**Signature**: `private async testRuntimeMemorySafe(iterations: number): Promise<boolean>`

##### testTypeSafety

**Signature**: `private async testTypeSafety(iterations: number): Promise<boolean>`

### Interfaces

#### FuzzingConfig

**Properties**:

- `maxIterations: number` - 
- `maxStringLength: number` - 
- `includeUnicode: boolean` - 
- `includeControlChars: boolean` - 
- `timeout: number` - 

#### FuzzingResult

**Properties**:

- `totalTests: number` - 
- `failures: Array<{
    input: string;
    error: string;
    type: 'parser' | 'runtime';
  }>` - 
- `crashes: number` - 
- `timeouts: number` - 

### Functions

#### runFuzzTest

Convenience function to run basic fuzzing

**Signature**: `export async function runFuzzTest(config?: Partial<FuzzingConfig>): Promise<FuzzingResult>`

#### runPropertyTest

Run property-based tests

**Signature**: `export async function runPropertyTest(property: string, iterations?: number): Promise<boolean>`


## docs-site

**File**: `/home/runner/work/Omniscript/Omniscript/src/docs-site/index.ts`

### Classes

#### StaticDocGenerator

**Properties**:

- `config: DocSiteConfig` - 

**Methods**:

##### generateSite

Generate complete static documentation site

**Signature**: `async generateSite(): Promise<void>`

##### createDirectoryStructure

**Signature**: `private createDirectoryStructure(): void`

##### processMarkdownFiles

**Signature**: `private async processMarkdownFiles(): Promise<void>`

##### getMarkdownFiles

**Signature**: `private getMarkdownFiles(dir: string): string[]`

##### convertMarkdownToHtml

**Signature**: `private async convertMarkdownToHtml(mdPath: string): Promise<void>`

##### markdownToHtml

**Signature**: `private markdownToHtml(markdown: string): string`

##### wrapInTemplate

**Signature**: `private wrapInTemplate(content: string, title: string): string`

##### generateNavigation

**Signature**: `private async generateNavigation(): Promise<void>`

##### generateAssets

**Signature**: `private async generateAssets(): Promise<void>`

##### generateVersionSelector

**Signature**: `private async generateVersionSelector(): Promise<void>`

##### deploy

Deploy to a static hosting service (stub for future implementation)

**Signature**: `async deploy(target: 'github-pages' | 'netlify' | 'vercel'): Promise<void>`

### Interfaces

#### DocSiteConfig

**Properties**:

- `name: string` - 
- `description: string` - 
- `baseUrl: string` - 
- `version: string` - 
- `logoUrl: string` - 
- `repository: string` - 
- `outputDir: string` - 
- `sourceDir: string` - 
- `theme: 'light' | 'dark' | 'auto'` - 

#### DocVersion

**Properties**:

- `version: string` - 
- `path: string` - 
- `isLatest: boolean` - 

### Functions

#### generateDocSite

Convenience function to generate documentation site

**Signature**: `export async function generateDocSite(config: Partial<DocSiteConfig>): Promise<void>`


## cli

**File**: `src/cli.ts`

### Functions

#### getOmniscript

**Signature**: `function getOmniscript(options?: any): Omniscript`

#### startRepl

**Signature**: `function startRepl(engine: Omniscript)`

#### findOmniscriptFiles

**Signature**: `async function findOmniscriptFiles(dir: string): Promise<string[]>`

#### formatOmniscriptCode

**Signature**: `function formatOmniscriptCode(source: string): string`

#### findOmniscriptFiles

**Signature**: `async function findOmniscriptFiles(dir: string): Promise<string[]>`

#### lintOmniscriptCode

**Signature**: `function lintOmniscriptCode(source: string, filename: string): Array<`

#### fixLintIssues

**Signature**: `function fixLintIssues(source: string, issues: Array<`

#### findOmniscriptFiles

**Signature**: `async function findOmniscriptFiles(dir: string): Promise<string[]>`


## installManager

**File**: `src/installManager.ts`

### Classes

#### OmniscriptInstaller

**Properties**:

- `TEMP_DIR: any` - 
- `REPO_URL: any` - 
- `RELEASE_URL: any` - 
- `FALLBACK_DOWNLOAD_URL: any` - 
- `ESSENTIAL_FILES: any` - 
- `CORE_FILES: any` - 

**Methods**:

##### downloadWithRetry

**Signature**: `static async downloadWithRetry(url: string, destPath: string, maxRetries: number = 3): Promise<void>`

##### downloadRepository

**Signature**: `static async downloadRepository(): Promise<string>`

##### extractFiles

**Signature**: `static async extractFiles(zipPath: string, targetDir: string): Promise<void>`

##### createMinimalInstall

**Signature**: `static async createMinimalInstall(installPath: string): Promise<void>`

##### verifyChecksums

**Signature**: `static async verifyChecksums(installPath: string): Promise<boolean>`

##### buildFromSource

**Signature**: `static async buildFromSource(installPath: string): Promise<void>`

##### ensureDependencies

**Signature**: `static async ensureDependencies(): Promise<void>`

##### extractTarGz

**Signature**: `private static async extractTarGz(source: string, dest: string): Promise<void>`

##### getNodeDownloadUrl

**Signature**: `private static getNodeDownloadUrl(): string`

##### getGitDownloadUrl

**Signature**: `private static getGitDownloadUrl(): string`

##### checkWritePermissions

**Signature**: `static async checkWritePermissions(path: string): Promise<boolean>`

##### getDefaultInstallPath

**Signature**: `static getDefaultInstallPath(options:`

##### cloneRepository

**Signature**: `private static async cloneRepository(installPath: string): Promise<void>`

##### install

**Signature**: `static async install(options:`

##### bundleCoreFiles

**Signature**: `private static async bundleCoreFiles(installPath: string): Promise<void>`

##### copyDir

**Signature**: `private static copyDir(src: string, dest: string): void`

##### setupEnvironment

**Signature**: `private static async setupEnvironment(installPath: string, userInstall?: boolean): Promise<void>`

##### createShortcuts

**Signature**: `private static async createShortcuts(installPath: string): Promise<void>`

##### verifyInstallation

**Signature**: `private static verifyInstallation(installPath: string): boolean`

##### isToolAvailable

**Signature**: `static isToolAvailable(tool: string): boolean`


## types

**File**: `src/compiler/types.ts`

### Interfaces

#### ASTNode

**Properties**:

- `type: string` - 

#### Program

**Extends**: `ASTNode`

**Properties**:

- `type: 'Program'` - 
- `body: ASTNode[]` - 

#### FunctionDeclaration

**Extends**: `ASTNode`

**Properties**:

- `type: 'FunctionDeclaration'` - 
- `id: { name: string }` - 
- `params: Parameter[]` - 
- `body: ASTNode[]` - 

#### Parameter

**Extends**: `ASTNode`

**Properties**:

- `type: 'Parameter'` - 
- `name: string` - 
- `typeAnnotation: string` - 

#### ReturnStatement

**Extends**: `ASTNode`

**Properties**:

- `type: 'ReturnStatement'` - 
- `argument: Expression | null` - 

#### Expression

**Extends**: `ASTNode`

**Properties**:

- `type: 'Expression'` - 
- `value: any` - 

#### ClassDeclaration

**Extends**: `ASTNode`

**Properties**:

- `type: 'ClassDeclaration'` - 
- `id: { name: string }` - 
- `superClass: { name: string }` - 
- `implements: { name: string }[]` - 
- `body: ClassMember[]` - 

#### InterfaceDeclaration

**Extends**: `ASTNode`

**Properties**:

- `type: 'InterfaceDeclaration'` - 
- `id: { name: string }` - 
- `extends: { name: string }[]` - 
- `body: InterfaceMember[]` - 

#### MethodDeclaration

**Extends**: `ASTNode`

**Properties**:

- `type: 'MethodDeclaration'` - 
- `id: { name: string }` - 
- `params: Parameter[]` - 
- `returnType: string` - 
- `body: ASTNode[]` - 
- `modifiers: string[]` - 

#### PropertyDeclaration

**Extends**: `ASTNode`

**Properties**:

- `type: 'PropertyDeclaration'` - 
- `id: { name: string }` - 
- `typeAnnotation: string` - 
- `initializer: Expression` - 
- `modifiers: string[]` - 

#### TypeAnnotation

**Extends**: `ASTNode`

**Properties**:

- `type: 'TypeAnnotation'` - 
- `typeAnnotation: string | ObjectType | ArrayType | FunctionType` - 

#### ClassMember

**Extends**: `ASTNode`

**Properties**:

- `type: 'ClassMember'` - 
- `modifiers: string[]` - 
- `declaration: MethodDeclaration | PropertyDeclaration` - 

#### InterfaceMember

**Extends**: `ASTNode`

**Properties**:

- `type: 'InterfaceMember'` - 
- `name: string` - 
- `typeAnnotation: TypeAnnotation` - 

#### ObjectType

**Extends**: `ASTNode`

**Properties**:

- `type: 'ObjectType'` - 
- `properties: { [key: string]: TypeAnnotation }` - 

#### ArrayType

**Extends**: `ASTNode`

**Properties**:

- `type: 'ArrayType'` - 
- `elementType: TypeAnnotation` - 

#### FunctionType

**Extends**: `ASTNode`

**Properties**:

- `type: 'FunctionType'` - 
- `parameters: TypeAnnotation[]` - 
- `returnType: TypeAnnotation` - 

#### GenericParameter

**Extends**: `ASTNode`

**Properties**:

- `type: 'GenericParameter'` - 
- `name: string` - 
- `constraint: TypeAnnotation` - 

#### MatchExpression

**Extends**: `ASTNode`

**Properties**:

- `type: 'MatchExpression'` - 
- `subject: Expression` - 
- `arms: MatchArm[]` - 

#### MatchArm

**Extends**: `ASTNode`

**Properties**:

- `type: 'MatchArm'` - 
- `pattern: Pattern` - 
- `expression: Expression` - 

#### Pattern

**Extends**: `ASTNode`

**Properties**:

- `type: 'Pattern'` - 
- `kind: 'literal' | 'variable' | 'wildcard' | 'or' | 'object' | 'array'` - 
- `value: any` - 
- `subPatterns: Pattern[]` - 

#### Decorator

**Extends**: `ASTNode`

**Properties**:

- `type: 'Decorator'` - 
- `name: string` - 
- `arguments: Expression[]` - 

#### OperatorDeclaration

**Extends**: `ASTNode`

**Properties**:

- `type: 'OperatorDeclaration'` - 
- `operator: string` - 
- `params: Parameter[]` - 
- `returnType: TypeAnnotation` - 
- `body: ASTNode[]` - 


## concurrency

**File**: `src/concurrency/index.ts`

### Classes

#### CSPChannel

**Implements**: `Channel`

**Properties**:

- `buffer: T[]` - 
- `waitingSenders: Array<{ value: T; resolve: () => void }>` - 
- `waitingReceivers: Array<{ resolve: (value: T) => void }>` - 
- `closed: any` - 

**Methods**:

##### send

**Signature**: `async send(value: T): Promise<void>`

##### receive

**Signature**: `async receive(): Promise<T>`

##### close

**Signature**: `close(): void`

##### isClosed

**Signature**: `isClosed(): boolean`

#### ChannelSelect

**Methods**:

##### select

**Signature**: `static async select<T>(selectOp: Select<T>): Promise<T>`

#### AsyncScheduler

**Properties**:

- `taskQueue: Array<() => Promise<void>>` - 
- `running: any` - 
- `maxConcurrency: any` - 

**Methods**:

##### schedule

**Signature**: `async schedule<T>(task: () => Promise<T>): Promise<T>`

##### processTasks

**Signature**: `private async processTasks(): Promise<void>`

##### parallel

**Signature**: `async parallel<T>(tasks: Array<() => Promise<T>>): Promise<T[]>`

##### race

**Signature**: `async race<T>(tasks: Array<() => Promise<T>>): Promise<T>`

#### WorkerPool

**Properties**:

- `workers: CustomWorker[]` - 
- `availableWorkers: CustomWorker[]` - 
- `taskQueue: Array<{ task: any; resolve: (value: any) => void; reject: (error: any) => void }>` - 

**Methods**:

##### initializeWorkers

**Signature**: `private initializeWorkers(): void`

##### execute

**Signature**: `async execute<T>(task: () => T): Promise<T>`

##### processTasks

**Signature**: `private async processTasks(): Promise<void>`

##### terminate

**Signature**: `terminate(): void`

#### AtomicOperations

**Properties**:

- `locks: Map<string, boolean>` - 
- `waitQueues: Map<string, Array<() => void>>` - 

**Methods**:

##### lock

**Signature**: `async lock(key: string): Promise<void>`

##### unlock

**Signature**: `unlock(key: string): void`

##### withLock

**Signature**: `async withLock<T>(key: string, operation: () => Promise<T>): Promise<T>`

##### compareAndSwap

**Signature**: `compareAndSwap<T>(target:`

#### Future

**Properties**:

- `promise: Promise<T>` - 
- `resolveCallback: (value: T) => void` - 
- `rejectCallback: (error: any) => void` - 
- `completed: any` - 
- `value: T` - 
- `error: any` - 

**Methods**:

##### complete

**Signature**: `complete(value: T): void`

##### completeExceptionally

**Signature**: `completeExceptionally(error: any): void`

##### isCompleted

**Signature**: `isCompleted(): boolean`

##### get

**Signature**: `async get(): Promise<T>`

##### timeout

**Signature**: `async timeout(ms: number): Promise<T>`

##### map

**Signature**: `map<U>(fn: (value: T) => U): Future<U>`

##### flatMap

**Signature**: `flatMap<U>(fn: (value: T) => Future<U>): Future<U>`

#### ReactiveStream

**Properties**:

- `subscribers: Array<(value: T) => void>` - 
- `errorHandlers: Array<(error: any) => void>` - 
- `completeHandlers: Array<() => void>` - 
- `completed: any` - 

**Methods**:

##### emit

**Signature**: `emit(value: T): void`

##### emitError

**Signature**: `emitError(error: any): void`

##### complete

**Signature**: `complete(): void`

##### subscribe

**Signature**: `subscribe(handler: (value: T) => void): () => void`

##### onError

**Signature**: `onError(handler: (error: any) => void): () => void`

##### onComplete

**Signature**: `onComplete(handler: () => void): () => void`

##### map

**Signature**: `map<U>(fn: (value: T) => U): ReactiveStream<U>`

##### filter

**Signature**: `filter(predicate: (value: T) => boolean): ReactiveStream<T>`

##### take

**Signature**: `take(count: number): ReactiveStream<T>`

### Interfaces

#### Channel

**Methods**:

##### send

**Signature**: `send(value: T): Promise<void>;`

##### receive

**Signature**: `receive(): Promise<T>;`

##### close

**Signature**: `close(): void;`

##### isClosed

**Signature**: `isClosed(): boolean;`

#### Select

**Properties**:

- `cases: SelectCase<T>[]` - 
- `default: () => T` - 
- `timeout: number` - 

#### SelectCase

**Properties**:

- `channel: Channel<any>` - 
- `operation: 'send' | 'receive'` - 
- `value: any` - 
- `handler: (value?: any) => T` - 

#### CustomWorker

**Properties**:

- `id: number` - 
- `busy: boolean` - 
- `execute: (task: any) => Promise<any>` - 
- `terminate: () => void` - 


## metaprogramming

**File**: `src/metaprogramming/index.ts`

### Classes

#### MacroProcessor

**Properties**:

- `macros: Map<string, MacroDefinition>` - 
- `expansionHistory: MacroExpansion[]` - 

**Methods**:

##### registerMacro

**Signature**: `registerMacro(definition: MacroDefinition): void`

##### expandMacros

**Signature**: `expandMacros(source: string): string`

##### expandMacro

**Signature**: `private expandMacro(macro: MacroDefinition, argsString: string, original: string): string`

##### parseArguments

**Signature**: `private parseArguments(argsString: string): string[]`

##### registerBuiltinMacros

**Signature**: `private registerBuiltinMacros(): void`

##### getExpansionHistory

**Signature**: `getExpansionHistory(): MacroExpansion[]`

##### clearHistory

**Signature**: `clearHistory(): void`

#### CompileTimeEvaluator

**Properties**:

- `constants: Map<string, any>` - 

**Methods**:

##### evaluateExpression

**Signature**: `evaluateExpression(expr: string): any`

##### evaluateValue

**Signature**: `private evaluateValue(value: string): any`

##### getConstants

**Signature**: `getConstants(): Map<string, any>`

#### ReflectionAPI

**Properties**:

- `typeMetadata: Map<string, any>` - 
- `decoratorMetadata: Map<string, any[]>` - 

**Methods**:

##### setTypeMetadata

**Signature**: `setTypeMetadata(typeName: string, metadata: any): void`

##### getTypeMetadata

**Signature**: `getTypeMetadata(typeName: string): any`

##### addDecoratorMetadata

**Signature**: `addDecoratorMetadata(target: string, decorator: any): void`

##### getDecoratorMetadata

**Signature**: `getDecoratorMetadata(target: string): any[]`

##### hasDecorator

**Signature**: `hasDecorator(target: string, decoratorName: string): boolean`

##### getMethodSignature

**Signature**: `getMethodSignature(className: string, methodName: string): any`

##### getPropertyType

**Signature**: `getPropertyType(className: string, propertyName: string): string`

##### listMethods

**Signature**: `listMethods(className: string): string[]`

##### listProperties

**Signature**: `listProperties(className: string): string[]`

### Interfaces

#### MacroDefinition

**Properties**:

- `name: string` - 
- `parameters: string[]` - 
- `body: string` - 
- `isCompileTime: boolean` - 

#### MacroExpansion

**Properties**:

- `original: string` - 
- `expanded: string` - 
- `context: Record<string, any>` - 


## pattern-matching

**File**: `src/pattern-matching/index.ts`

### Classes

#### PatternMatcher

**Properties**:

- `caseHistory: MatchCase[]` - 

**Methods**:

##### match

**Signature**: `match(value: any, cases: MatchCase[]): any`

##### analyzeExhaustiveness

**Signature**: `analyzeExhaustiveness(cases: MatchCase[], valueType: string): MatchAnalysis`

##### matchPattern

**Signature**: `private matchPattern(value: any, pattern: Pattern, bindings: Map<string, any>): boolean`

##### matchLiteral

**Signature**: `private matchLiteral(value: any, patternValue: any): boolean`

##### matchConstructor

**Signature**: `private matchConstructor(value: any, pattern: Pattern, bindings: Map<string, any>): boolean`

##### matchArray

**Signature**: `private matchArray(value: any, pattern: Pattern, bindings: Map<string, any>): boolean`

##### matchObject

**Signature**: `private matchObject(value: any, pattern: Pattern, bindings: Map<string, any>): boolean`

##### evaluateGuard

**Signature**: `private evaluateGuard(guard: any, bindings: Map<string, any>): boolean`

##### executeAction

**Signature**: `private executeAction(action: any, bindings: Map<string, any>): any`

##### patternSubsumes

**Signature**: `private patternSubsumes(pattern1: Pattern, pattern2: Pattern): boolean`

##### patternsSubsume

**Signature**: `private patternsSubsume(patterns1: Pattern[], patterns2: Pattern[]): boolean`

##### objectPatternSubsumes

**Signature**: `private objectPatternSubsumes(props1: Record<string, Pattern>, props2: Record<string, Pattern>): boolean`

##### findMissingPatterns

**Signature**: `private findMissingPatterns(cases: MatchCase[], valueType: string): Pattern[]`

##### matchesLiteral

**Signature**: `private matchesLiteral(pattern: Pattern, value: any): boolean`

##### matchesConstructor

**Signature**: `private matchesConstructor(pattern: Pattern, name: string): boolean`

#### PatternBuilder

**Methods**:

##### literal

**Signature**: `static literal(value: any): Pattern`

##### identifier

**Signature**: `static identifier(name: string): Pattern`

##### wildcard

**Signature**: `static wildcard(): Pattern`

##### constructorPattern

**Signature**: `static constructorPattern(name: string, patterns?: Pattern[]): Pattern`

##### array

**Signature**: `static array(patterns: Pattern[]): Pattern`

##### object

**Signature**: `static object(properties: Record<string, Pattern>): Pattern`

##### guard

**Signature**: `static guard(pattern: Pattern, condition: any): Pattern`

##### some

**Signature**: `static some(innerPattern: Pattern): Pattern`

##### none

**Signature**: `static none(): Pattern`

##### cons

**Signature**: `static cons(head: Pattern, tail: Pattern): Pattern`

##### nil

**Signature**: `static nil(): Pattern`

#### MatchCompiler

**Methods**:

##### compile

**Signature**: `compile(matchExpr:`

### Interfaces

#### Pattern

**Properties**:

- `type: 'literal' | 'identifier' | 'wildcard' | 'constructor' | 'array' | 'object' | 'guard'` - 
- `value: any` - 
- `name: string` - 
- `patterns: Pattern[]` - 
- `properties: Record<string, Pattern>` - 
- `condition: any` - 

#### MatchCase

**Properties**:

- `pattern: Pattern` - 
- `guard: any` - 
- `action: any` - 
- `bindings: Map<string, any>` - 

#### MatchAnalysis

**Properties**:

- `isExhaustive: boolean` - 
- `missingPatterns: Pattern[]` - 
- `redundantCases: number[]` - 
- `warnings: string[]` - 


## actor

**File**: `src/runtime/actor.ts`

### Classes

#### Actor

**Implements**: `ActorRef`

**Properties**:

- `id: string` - 
- `state: TState` - 
- `behavior: ActorBehavior<TState>` - 
- `messageQueue: ActorMessage[]` - 
- `isProcessing: boolean` - 
- `isActive: boolean` - 
- `options: Required<ActorOptions>` - 
- `retryCount: number` - 
- `metrics: any` - 

**Methods**:

##### send

**Signature**: `async send(message: ActorMessage): Promise<void>`

##### ask

**Signature**: `async ask<T>(message: ActorMessage, timeout: number = 5000): Promise<T>`

##### processNextMessage

**Signature**: `private async processNextMessage(): Promise<void>`

##### handleError

**Signature**: `private async handleError(error: Error, message: ActorMessage): Promise<void>`

##### stop

**Signature**: `stop(): void`

##### getMetrics

**Signature**: `getMetrics()`

#### ActorSystem

**Properties**:

- `actors: Map<string, Actor>` - 
- `nextId: number` - 

**Methods**:

##### createActor

**Signature**: `createActor<TState>(
    behavior: ActorBehavior<TState>,
    initialState: TState,
    options: ActorOptions =`

##### getActor

**Signature**: `getActor(id: string): ActorRef | undefined`

##### broadcastMessage

**Signature**: `async broadcastMessage(message: ActorMessage): Promise<void>`

##### stopActor

**Signature**: `stopActor(id: string): void`

##### stopAll

**Signature**: `stopAll(): void`

##### getSystemMetrics

**Signature**: `getSystemMetrics()`

### Interfaces

#### ActorMessage

**Properties**:

- `id: string` - 
- `type: string` - 
- `payload: any` - 
- `sender: ActorRef` - 
- `timestamp: number` - 

#### ActorRef

**Properties**:

- `id: string` - 

**Methods**:

##### send

**Signature**: `send(message: ActorMessage): Promise<void>;`

##### ask

**Signature**: `ask<T>(message: ActorMessage, timeout?: number): Promise<T>;`

#### ActorBehavior

#### ActorOptions

**Properties**:

- `name: string` - 
- `supervisionStrategy: 'restart' | 'stop' | 'escalate'` - 
- `maxRetries: number` - 
- `messageQueueSize: number` - 
- `enableLogging: boolean` - 

### Functions

#### createCounterActor

**Signature**: `export function createCounterActor(initialValue: number = 0): ActorRef`

#### createAccumulatorActor

**Signature**: `export function createAccumulatorActor<T>(initialValue: T[] = []): ActorRef`


## event-sourcing

**File**: `src/runtime/event-sourcing.ts`

### Classes

#### InMemoryEventStore

**Implements**: `EventStore`

**Properties**:

- `events: DomainEvent[]` - 
- `eventsByAggregate: Map<string, DomainEvent[]>` - 
- `eventsByType: Map<string, DomainEvent[]>` - 

**Methods**:

##### append

**Signature**: `async append(events: DomainEvent[]): Promise<void>`

##### getEvents

**Signature**: `async getEvents(aggregateId: string, fromVersion: number = 0): Promise<DomainEvent[]>`

##### getAllEvents

**Signature**: `async getAllEvents(fromTimestamp: number = 0): Promise<DomainEvent[]>`

##### getEventsByType

**Signature**: `async getEventsByType(eventType: string): Promise<DomainEvent[]>`

#### InMemorySnapshotStore

**Implements**: `SnapshotStore`

**Properties**:

- `snapshots: Map<string, Snapshot<any>>` - 

**Methods**:

##### save

**Signature**: `async save<T>(snapshot: Snapshot<T>): Promise<void>`

##### get

**Signature**: `async get<T>(aggregateId: string): Promise<Snapshot<T> | null>`

#### AggregateRoot

**Properties**:

- `id: string` - 
- `version: number` - 
- `uncommittedEvents: DomainEvent[]` - 

**Methods**:

##### getTypeName

**Signature**: `abstract getTypeName(): string;`

##### applyEvent

**Signature**: `abstract applyEvent(event: DomainEvent): void;`

##### getId

**Signature**: `getId(): string`

##### getVersion

**Signature**: `getVersion(): number`

##### addEvent

**Signature**: `protected addEvent(eventType: string, payload: any, metadata: Record<string, any> =`

##### getUncommittedEvents

**Signature**: `getUncommittedEvents(): DomainEvent[]`

##### markEventsAsCommitted

**Signature**: `markEventsAsCommitted(): void`

##### loadFromHistory

**Signature**: `loadFromHistory(events: DomainEvent[]): void`

##### createSnapshot

**Signature**: `createSnapshot(): Snapshot<T>`

##### loadFromSnapshot

**Signature**: `loadFromSnapshot(snapshot: Snapshot<T>): void`

##### getState

**Signature**: `protected abstract getState(): T;`

##### loadState

**Signature**: `protected abstract loadState(state: T): void;`

##### generateEventId

**Signature**: `private generateEventId(): string`

#### EventBus

**Properties**:

- `handlers: Map<string, EventHandler[]>` - 
- `projections: Map<string, (event: DomainEvent) => Promise<void>>` - 

**Methods**:

##### subscribe

**Signature**: `subscribe(eventType: string, handler: EventHandler): void`

##### addProjection

**Signature**: `addProjection(name: string, projectionHandler: (event: DomainEvent) => Promise<void>): void`

##### publish

**Signature**: `async publish(event: DomainEvent): Promise<void>`

#### Repository

**Methods**:

##### save

**Signature**: `async save(aggregate: T): Promise<void>`

##### getById

**Signature**: `async getById(id: string, aggregateFactory: (id: string) => T): Promise<T | null>`

#### UserAggregate

**Extends**: `AggregateRoot`

**Properties**:

- `name: string` - 
- `email: string` - 
- `isActive: boolean` - 

**Methods**:

##### getTypeName

**Signature**: `getTypeName(): string`

##### register

**Signature**: `register(name: string, email: string): void`

##### changeEmail

**Signature**: `changeEmail(newEmail: string): void`

##### deactivate

**Signature**: `deactivate(): void`

##### applyEvent

**Signature**: `applyEvent(event: DomainEvent): void`

##### getState

**Signature**: `protected getState():`

##### loadState

**Signature**: `protected loadState(state:`

##### getName

**Signature**: `getName(): string`

##### getEmail

**Signature**: `getEmail(): string`

##### getIsActive

**Signature**: `getIsActive(): boolean`

#### EventSourcingSystem

**Properties**:

- `eventStore: EventStore` - 
- `snapshotStore: SnapshotStore` - 
- `eventBus: EventBus` - 

**Methods**:

##### getEventStore

**Signature**: `getEventStore(): EventStore`

##### getSnapshotStore

**Signature**: `getSnapshotStore(): SnapshotStore`

##### getEventBus

**Signature**: `getEventBus(): EventBus`

##### createRepository

**Signature**: `createRepository<T extends AggregateRoot>(snapshotFrequency: number = 10): Repository<T>`

##### replay

**Signature**: `async replay(fromTimestamp: number = 0): Promise<void>`

### Interfaces

#### DomainEvent

**Properties**:

- `id: string` - 
- `type: string` - 
- `aggregateId: string` - 
- `aggregateType: string` - 
- `payload: any` - 
- `metadata: Record<string, any>` - 
- `timestamp: number` - 
- `version: number` - 
- `causationId: string` - 
- `correlationId: string` - 

#### EventStore

**Methods**:

##### append

**Signature**: `append(events: DomainEvent[]): Promise<void>;`

##### getEvents

**Signature**: `getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;`

##### getAllEvents

**Signature**: `getAllEvents(fromTimestamp?: number): Promise<DomainEvent[]>;`

##### getEventsByType

**Signature**: `getEventsByType(eventType: string): Promise<DomainEvent[]>;`

#### Snapshot

**Properties**:

- `aggregateId: string` - 
- `aggregateType: string` - 
- `data: T` - 
- `version: number` - 
- `timestamp: number` - 

#### SnapshotStore

**Methods**:

##### save

**Signature**: `save<T>(snapshot: Snapshot<T>): Promise<void>;`

##### get

**Signature**: `get<T>(aggregateId: string): Promise<Snapshot<T> | null>;`

#### EventHandler

**Properties**:

- `eventType: string` - 

**Methods**:

##### handle

**Signature**: `handle(event: DomainEvent): Promise<T>;`


## optimizer

**File**: `src/runtime/optimizer.ts`

### Classes

#### JITCompiler

Just-In-Time compiler for hot code paths

**Properties**:

- `compiledFunctions: any` - 
- `compilationThreshold: any` - 
- `profile: OptimizationProfile` - 

**Methods**:

##### shouldCompile

**Signature**: `shouldCompile(functionName: string): boolean`

##### compile

**Signature**: `compile(functionName: string, bytecode: any[]): Function`

##### generateOptimizedCode

**Signature**: `private generateOptimizedCode(bytecode: any[]): string`

##### compileInstruction

**Signature**: `private compileInstruction(instruction: any, index: number): string`

##### createInterpreterFallback

**Signature**: `private createInterpreterFallback(bytecode: any[]): Function`

##### getCompiledFunction

**Signature**: `getCompiledFunction(name: string): Function | undefined`

##### clearCache

**Signature**: `clearCache(): void`

#### DeadCodeEliminator

Dead code elimination optimizer

**Methods**:

##### eliminate

**Signature**: `eliminate(bytecode: any[]): OptimizedBytecode`

##### markReachable

**Signature**: `private markReachable(bytecode: any[], start: number, reachable: Set<number>): void`

#### ConstantFolder

Constant folding optimizer

**Methods**:

##### fold

**Signature**: `fold(bytecode: any[]): OptimizedBytecode`

##### tryFoldAt

**Signature**: `private tryFoldAt(bytecode: any[], index: number):`

#### PeepholeOptimizer

Peephole optimizer for local optimizations

**Methods**:

##### optimize

**Signature**: `optimize(bytecode: any[]): OptimizedBytecode`

##### tryOptimizeAt

**Signature**: `private tryOptimizeAt(bytecode: any[], index: number):`

#### RuntimeOptimizer

Main runtime optimizer that combines all optimization passes

**Properties**:

- `jitCompiler: JITCompiler` - 
- `deadCodeEliminator: any` - 
- `constantFolder: any` - 
- `peepholeOptimizer: any` - 
- `profile: OptimizationProfile` - 

**Methods**:

##### optimizeBytecode

**Signature**: `optimizeBytecode(bytecode: any[]): OptimizedBytecode`

##### profileFunction

**Signature**: `profileFunction(name: string, executionTime: number): void`

##### shouldJITCompile

**Signature**: `shouldJITCompile(functionName: string): boolean`

##### compileFunction

**Signature**: `compileFunction(name: string, bytecode: any[]): Function`

##### getCompiledFunction

**Signature**: `getCompiledFunction(name: string): Function | undefined`

##### getProfile

**Signature**: `getProfile(): OptimizationProfile`

##### getHotFunctions

**Signature**: `getHotFunctions(): string[]`

##### getOptimizationReport

**Signature**: `getOptimizationReport():`

##### reset

**Signature**: `reset(): void`

### Interfaces

#### OptimizationProfile

Runtime optimizer for Omniscript
Provides JIT compilation, dead code elimination, and performance optimizations

**Properties**:

- `callCounts: Map<string, number>` - 
- `hotFunctions: Set<string>` - 
- `memoryUsage: Map<string, number>` - 
- `executionTimes: Map<string, number[]>` - 

#### OptimizedBytecode

**Properties**:

- `original: any[]` - 
- `optimized: any[]` - 
- `optimizations: string[]` - 
- `speedup: number` - 


## ssr

**File**: `src/ssr/index.ts`

### Classes

#### SSRRenderer

**Properties**:

- `runtime: Runtime` - 
- `config: SSRConfig` - 
- `componentCache: Map<string, any>` - 
- `templateCache: Map<string, string>` - 

**Methods**:

##### initializeRenderer

**Signature**: `private initializeRenderer(): void`

##### createServerDocument

**Signature**: `private createServerDocument(): any`

##### setupSSRGlobals

**Signature**: `private setupSSRGlobals(): void`

##### render

**Signature**: `async render(context: RenderContext): Promise<RenderResult>`

##### loadEntryFile

**Signature**: `private async loadEntryFile(): Promise<string>`

##### renderApp

**Signature**: `private async renderApp(app: any, context: RenderContext): Promise<RenderResult>`

##### matchRoute

**Signature**: `private matchRoute(url: string):`

##### getComponent

**Signature**: `private async getComponent(componentName: string): Promise<any>`

##### createMockComponent

**Signature**: `private createMockComponent(name: string): any`

##### renderComponentTree

**Signature**: `private async renderComponentTree(component: any, context: RenderContext): Promise<string>`

##### renderComponentToString

**Signature**: `private renderComponentToString(component: any): string`

##### extractAssets

**Signature**: `private extractAssets():`

##### extractMeta

**Signature**: `private extractMeta(component: any): any`

##### generateMetaTags

**Signature**: `private generateMetaTags(meta: any): string`

##### applyTemplate

**Signature**: `private applyTemplate(html: string, assets:`

##### getTemplate

**Signature**: `private getTemplate(): string`

##### renderErrorPage

**Signature**: `private renderErrorPage(error: any): string`

##### createServerApp

**Signature**: `private createServerApp(config: any): any`

##### createSSRMiddleware

**Signature**: `createSSRMiddleware()`

##### generateStaticSite

**Signature**: `async generateStaticSite(): Promise<void>`

##### generateStaticPage

**Signature**: `private async generateStaticPage(route: string, outputDir: string): Promise<void>`

##### copyStaticFiles

**Signature**: `private async copyStaticFiles(outputDir: string): Promise<void>`

##### generateSitemap

**Signature**: `private async generateSitemap(outputDir: string): Promise<void>`

#### SSRBuilder

**Properties**:

- `config: SSRConfig` - 

**Methods**:

##### build

**Signature**: `async build(): Promise<void>`

##### createDevelopmentServer

**Signature**: `createDevelopmentServer(): any`

### Interfaces

#### SSRConfig

**Properties**:

- `entry: string` - 
- `outputDir: string` - 
- `templatePath: string` - 
- `staticDir: string` - 
- `enableHydration: boolean` - 
- `minify: boolean` - 
- `generateSitemap: boolean` - 
- `routes: string[]` - 

#### RenderContext

**Properties**:

- `url: string` - 
- `params: Record<string, string>` - 
- `query: Record<string, string>` - 
- `headers: Record<string, string>` - 
- `state: any` - 

#### RenderResult

**Properties**:

- `html: string` - 
- `css: string` - 
- `js: string` - 
- `meta: {
    title?: string;
    description?: string;
    keywords?: string[];
    og?: Record<string, string>;
  }` - 
- `statusCode: number` - 
- `redirectTo: string` - 


## math

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/math.ts`

### Classes

#### MathUtils

**Properties**:

- `PI: number` - 
- `E: number` - 
- `GOLDEN_RATIO: number` - 
- `SQRT_2: number` - 
- `SQRT_3: number` - 

**Methods**:

##### sum

**Signature**: `static sum(numbers: number[]): number`

##### mean

**Signature**: `static mean(numbers: number[]): number`

##### median

**Signature**: `static median(numbers: number[]): number`

##### mode

**Signature**: `static mode(numbers: number[]): number | number[]`

##### std

**Signature**: `static std(numbers: number[]): number`

##### variance

**Signature**: `static variance(numbers: number[]): number`

##### min

**Signature**: `static min(numbers: number[]): number`

##### max

**Signature**: `static max(numbers: number[]): number`

##### range

**Signature**: `static range(numbers: number[]): number`

##### factorial

**Signature**: `static factorial(n: number): number`

##### fibonacci

**Signature**: `static fibonacci(n: number): number`

##### fibonacciSequence

**Signature**: `static fibonacciSequence(n: number): number[]`

##### gcd

**Signature**: `static gcd(a: number, b: number): number`

##### lcm

**Signature**: `static lcm(a: number, b: number): number`

##### isPrime

**Signature**: `static isPrime(n: number): boolean`

##### primes

**Signature**: `static primes(n: number): number[]`

##### random

**Signature**: `static random(min: number = 0, max: number = 1): number`

##### randomInt

**Signature**: `static randomInt(min: number, max: number): number`

##### randomChoice

**Signature**: `static randomChoice<T>(array: T[]): T`

##### shuffle

**Signature**: `static shuffle<T>(array: T[]): T[]`

##### degToRad

**Signature**: `static degToRad(degrees: number): number`

##### radToDeg

**Signature**: `static radToDeg(radians: number): number`

##### sinDeg

**Signature**: `static sinDeg(degrees: number): number`

##### cosDeg

**Signature**: `static cosDeg(degrees: number): number`

##### tanDeg

**Signature**: `static tanDeg(degrees: number): number`

##### dotProduct

**Signature**: `static dotProduct(a: number[], b: number[]): number`

##### vectorMagnitude

**Signature**: `static vectorMagnitude(vector: number[]): number`

##### normalize

**Signature**: `static normalize(vector: number[]): number[]`

##### crossProduct

**Signature**: `static crossProduct(a: number[], b: number[]): number[]`

##### matrixAdd

**Signature**: `static matrixAdd(a: number[][], b: number[][]): number[][]`

##### matrixMultiply

**Signature**: `static matrixMultiply(a: number[][], b: number[][]): number[][]`

##### matrixTranspose

**Signature**: `static matrixTranspose(matrix: number[][]): number[][]`

##### matrixDeterminant2x2

**Signature**: `static matrixDeterminant2x2(matrix: number[][]): number`

##### linearInterpolation

**Signature**: `static linearInterpolation(x1: number, y1: number, x2: number, y2: number, x: number): number`

##### clamp

**Signature**: `static clamp(value: number, min: number, max: number): number`

##### lerp

**Signature**: `static lerp(a: number, b: number, t: number): number`

##### isEven

**Signature**: `static isEven(n: number): boolean`

##### isOdd

**Signature**: `static isOdd(n: number): boolean`

##### isPowerOfTwo

**Signature**: `static isPowerOfTwo(n: number): boolean`

##### nextPowerOfTwo

**Signature**: `static nextPowerOfTwo(n: number): number`

##### approxEqual

**Signature**: `static approxEqual(a: number, b: number, epsilon: number = 1e-10): boolean`

##### roundTo

**Signature**: `static roundTo(value: number, decimals: number): number`

##### formatNumber

**Signature**: `static formatNumber(value: number, decimals: number = 2): string`

##### complexAdd

**Signature**: `static complexAdd(a:`

##### complexMultiply

**Signature**: `static complexMultiply(a:`

##### complexMagnitude

**Signature**: `static complexMagnitude(complex:`

##### normalDistribution

**Signature**: `static normalDistribution(x: number, mean: number = 0, stdDev: number = 1): number`

##### uniformDistribution

**Signature**: `static uniformDistribution(x: number, min: number = 0, max: number = 1): number`

##### exponentialDistribution

**Signature**: `static exponentialDistribution(x: number, lambda: number = 1): number`

##### derivative

**Signature**: `static derivative(fn: (x: number) => number, x: number, h: number = 1e-7): number`

##### integral

**Signature**: `static integral(fn: (x: number) => number, a: number, b: number, n: number = 1000): number`

##### newtonRaphson

**Signature**: `static newtonRaphson(fn: (x: number) => number, x0: number, maxIterations: number = 100, tolerance: number = 1e-10): number`

##### distance2D

**Signature**: `static distance2D(p1:`

##### distance3D

**Signature**: `static distance3D(p1:`

##### pointInPolygon

**Signature**: `static pointInPolygon(point:`

##### convexHull

**Signature**: `static convexHull(points:`

##### cross

**Signature**: `private static cross(o:`

##### presentValue

**Signature**: `static presentValue(futureValue: number, rate: number, periods: number): number`

##### futureValue

**Signature**: `static futureValue(presentValue: number, rate: number, periods: number): number`

##### compoundInterest

**Signature**: `static compoundInterest(principal: number, rate: number, periods: number, compoundingFrequency: number = 1): number`

##### annuityPayment

**Signature**: `static annuityPayment(principal: number, rate: number, periods: number): number`

##### gamma

**Signature**: `static gamma(z: number): number`

##### nextPrime

**Signature**: `static nextPrime(n: number): number`

##### primeFactors

**Signature**: `static primeFactors(n: number): number[]`

##### gcdMultiple

**Signature**: `static gcdMultiple(...numbers: number[]): number`

##### lcmMultiple

**Signature**: `static lcmMultiple(...numbers: number[]): number`

##### sinh

**Signature**: `static sinh(x: number): number`

##### cosh

**Signature**: `static cosh(x: number): number`

##### tanh

**Signature**: `static tanh(x: number): number`

##### asinh

**Signature**: `static asinh(x: number): number`

##### acosh

**Signature**: `static acosh(x: number): number`

##### atanh

**Signature**: `static atanh(x: number): number`

##### modPow

**Signature**: `static modPow(base: number, exponent: number, modulus: number): number`

##### isPerfectSquare

**Signature**: `static isPerfectSquare(n: number): boolean`

##### permutations

**Signature**: `static permutations(n: number, r: number): number`

##### combinations

**Signature**: `static combinations(n: number, r: number): number`

##### floorTo

**Signature**: `static floorTo(value: number, decimals: number): number`

##### ceilTo

**Signature**: `static ceilTo(value: number, decimals: number): number`

##### truncateTo

**Signature**: `static truncateTo(value: number, decimals: number): number`

##### percentile

**Signature**: `static percentile(numbers: number[], percentile: number): number`

##### quartiles

**Signature**: `static quartiles(numbers: number[]):`

##### iqr

**Signature**: `static iqr(numbers: number[]): number`

##### zScore

**Signature**: `static zScore(value: number, mean: number, standardDeviation: number): number`

##### correlation

**Signature**: `static correlation(x: number[], y: number[]): number`

##### randomGaussian

**Signature**: `static randomGaussian(mean: number = 0, standardDeviation: number = 1): number`

##### sample

**Signature**: `static sample<T>(array: T[], count: number): T[]`

##### inverseLerp

**Signature**: `static inverseLerp(a: number, b: number, value: number): number`

##### map

**Signature**: `static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number`

##### smoothstep

**Signature**: `static smoothstep(edge0: number, edge1: number, x: number): number`


## ai

**File**: `src/stdlib/ai.ts`

### Classes

#### TensorPool

**Properties**:

- `pools: Map<string, number[][]>` - 
- `maxPoolSize: number` - 

**Methods**:

##### getPooledArray

**Signature**: `static getPooledArray(size: number): number[]`

##### returnToPool

**Signature**: `static returnToPool(array: number[], size: number): void`

##### clearPools

**Signature**: `static clearPools(): void`

#### Tensor

**Properties**:

- `data: number[]` - 
- `shape: TensorShape` - 
- `dtype: 'float32' | 'float64' | 'int32'` - 
- `device: 'cpu' | 'gpu'` - 
- `gradInfo: GradientInfo` - 
- `randomSeed: number | undefined` - 

**Methods**:

##### zeros

**Signature**: `static zeros(shape: number[], options: any =`

##### ones

**Signature**: `static ones(shape: number[], options: any =`

##### randn

**Signature**: `static randn(shape: number[], options: any =`

##### uniform

**Signature**: `static uniform(shape: number[], low: number = 0, high: number = 1, options: any =`

##### randomNormal

**Signature**: `private static randomNormal(mean: number = 0, std: number = 1): number`

##### resetRandomSeed

**Signature**: `static resetRandomSeed(seed: number = 12345): void`

##### add

**Signature**: `add(other: Tensor | number): Tensor`

##### mul

**Signature**: `mul(other: Tensor | number): Tensor`

##### matmul

**Signature**: `matmul(other: Tensor): Tensor`

##### transpose

**Signature**: `transpose(): Tensor`

##### reshape

**Signature**: `reshape(newShape: number[]): Tensor`

##### sum

**Signature**: `sum(axis?: number): Tensor`

##### mean

**Signature**: `mean(axis?: number): Tensor`

##### backward

**Signature**: `backward(gradient?: Tensor): void`

##### zeroGrad

**Signature**: `zeroGrad(): void`

##### broadcastable

**Signature**: `private broadcastable(other: Tensor): boolean`

##### toMatrix

**Signature**: `toMatrix(): number[][]`

##### fromMatrix

**Signature**: `static fromMatrix(matrix: number[][]): Tensor`

##### clone

**Signature**: `clone(): Tensor`

##### toString

**Signature**: `toString(): string`

##### dispose

**Signature**: `dispose(): void`

##### getMemoryUsage

**Signature**: `getMemoryUsage():`

#### Activations

**Methods**:

##### relu

**Signature**: `static relu(tensor: Tensor): Tensor`

##### sigmoid

**Signature**: `static sigmoid(tensor: Tensor): Tensor`

##### tanh

**Signature**: `static tanh(tensor: Tensor): Tensor`

##### softmax

**Signature**: `static softmax(tensor: Tensor): Tensor`

#### Layer

**Properties**:

- `parameters: Tensor[]` - 
- `training: boolean` - 

**Methods**:

##### forward

**Signature**: `abstract forward(input: Tensor): Tensor;`

##### train

**Signature**: `train(): void`

##### eval

**Signature**: `eval(): void`

##### getParameters

**Signature**: `getParameters(): Tensor[]`

##### zeroGrad

**Signature**: `zeroGrad(): void`

#### Linear

**Extends**: `Layer`

**Properties**:

- `weight: Tensor` - 
- `bias: Tensor` - 

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

#### Sequential

**Extends**: `Layer`

**Properties**:

- `layers: Layer[]` - 

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

##### train

**Signature**: `train(): void`

##### eval

**Signature**: `eval(): void`

#### ReLU

**Extends**: `Layer`

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

#### Sigmoid

**Extends**: `Layer`

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

#### Tanh

**Extends**: `Layer`

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

#### Softmax

**Extends**: `Layer`

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

#### LossFunctions

**Methods**:

##### mse

**Signature**: `static mse(predictions: Tensor, targets: Tensor): Tensor`

##### crossEntropy

**Signature**: `static crossEntropy(predictions: Tensor, targets: Tensor): Tensor`

##### binaryCrossEntropy

**Signature**: `static binaryCrossEntropy(predictions: Tensor, targets: Tensor): Tensor`

#### Optimizer

**Properties**:

- `parameters: Tensor[]` - 
- `lr: number` - 

**Methods**:

##### step

**Signature**: `abstract step(): void;`

##### zeroGrad

**Signature**: `zeroGrad(): void`

#### SGD

**Extends**: `Optimizer`

**Properties**:

- `momentum: number` - 
- `velocities: Map<Tensor, Tensor>` - 

**Methods**:

##### step

**Signature**: `step(): void`

#### Adam

**Extends**: `Optimizer`

**Properties**:

- `beta1: number` - 
- `beta2: number` - 
- `eps: number` - 
- `t: number` - 
- `m: Map<Tensor, Tensor>` - 
- `v: Map<Tensor, Tensor>` - 

**Methods**:

##### step

**Signature**: `step(): void`

#### ModelUtils

**Methods**:

##### saveModel

**Signature**: `static saveModel(model: Layer, path: string): any`

##### loadModel

**Signature**: `static loadModel(state: any): any`

##### countParameters

**Signature**: `static countParameters(model: Layer): number`

##### printModelSummary

**Signature**: `static printModelSummary(model: Layer): void`

#### Trainer

**Properties**:

- `model: Layer` - 
- `optimizer: Optimizer` - 
- `lossFunction: (pred: Tensor, target: Tensor) => Tensor` - 

**Methods**:

##### train

**Signature**: `train(
    trainData:`

##### evaluate

**Signature**: `evaluate(testData:`

#### AIUtils

**Methods**:

##### cleanup

**Signature**: `static cleanup(): void`

##### getMemoryStats

**Signature**: `static getMemoryStats():`

##### optimizeMemory

**Signature**: `static optimizeMemory(): void`

### Interfaces

#### TensorShape

**Properties**:

- `dimensions: number[]` - 
- `size: number` - 
- `ndim: number` - 

#### GradientInfo

**Properties**:

- `requiresGrad: boolean` - 
- `grad: Tensor` - 
- `gradFn: Function` - 
- `retainGraph: boolean` - 


## async

**File**: `src/stdlib/async.ts`

### Classes

#### AsyncUtils

**Methods**:

##### sleep

Sleep for specified milliseconds

**Signature**: `static sleep(ms: number): Promise<void>`

##### timeout

Add timeout to a promise

**Signature**: `static timeout<T>(promise: Promise<T>, ms: number, options?: TimeoutOptions): Promise<T>`

##### retry

Retry a function with configurable options

**Signature**: `static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions
  ): Promise<T>`

##### parallel

Execute promises with limited concurrency

**Signature**: `static async parallel<T>(
    tasks: (() => Promise<T>)[],
    maxConcurrency: number = 5
  ): Promise<T[]>`

##### sequence

Execute promises in sequence (one after another)

**Signature**: `static async sequence<T>(tasks: (() => Promise<T>)[]): Promise<T[]>`

##### debounce

Debounce a function call

**Signature**: `static debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ): T`

##### throttle

Throttle a function call

**Signature**: `static throttle<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ): T`

##### createRateLimiter

Create a simple rate limiter

**Signature**: `static createRateLimiter(options: RateLimiterOptions)`

##### poll

Poll a function until it returns a truthy value or times out

**Signature**: `static async poll<T>(
    fn: () => Promise<T> | T,
    options:`

##### first

Create a promise that resolves to the first resolved value

**Signature**: `static async first<T>(promises: Promise<T>[]): Promise<T>`

##### allSettled

Create a promise that resolves when all promises settle (succeed or fail)

**Signature**: `static async allSettled<T>(promises: Promise<T>[]): Promise<Array<`

##### promisify

Wrap a callback-based function to return a promise

**Signature**: `static promisify<T extends (...args: any[]) => void>(
    fn: T
  ): (...args: any[]) => Promise<any>`

##### cancellable

Create a cancellable promise

**Signature**: `static cancellable<T>(
    executor: (resolve: (value: T) => void, reject: (reason: any) => void, signal: AbortSignal) => void
  ):`

##### memoizeAsync

Memoize async function results

**Signature**: `static memoizeAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyFn?: (...args: Parameters<T>) => string
  ): T`

##### delay

Create a promise that resolves after a delay

**Signature**: `static delay<T>(ms: number, value?: T): Promise<T | undefined>`

##### measure

Execute a function and measure its execution time

**Signature**: `static async measure<T>(fn: () => Promise<T>): Promise<`

#### AsyncPatterns

Advanced async patterns and utilities - Extended

**Methods**:

##### cancellable

Create a cancellable async operation

**Signature**: `static cancellable<T>(operation: (signal: AbortSignal) => Promise<T>):`

##### pipeline

Create an async pipeline with transformation steps

**Signature**: `static pipeline<T, U>(
    input: T,
    ...steps: Array<(value: any) => Promise<any> | any>
  ): Promise<U>`

##### reduce

Async reduce with concurrency control

**Signature**: `static async reduce<T, U>(
    items: T[],
    reducer: (acc: U, item: T, index: number) => Promise<U>,
    initialValue: U,
    concurrency: number = 1
  ): Promise<U>`

##### createQueue

Create an async queue with processing function

**Signature**: `static createQueue<T, U>(
    processor: (item: T) => Promise<U>,
    options:`

##### createSemaphore

Create a semaphore for resource limiting

**Signature**: `static createSemaphore(permits: number):`

##### createCircuitBreaker

Create a circuit breaker for fault tolerance

**Signature**: `static createCircuitBreaker<T extends any[], U>(
    fn: (...args: T) => Promise<U>,
    options:`

##### raceN

Race multiple async operations, return first N results

**Signature**: `static async raceN<T>(
    promises: Promise<T>[],
    count: number
  ): Promise<T[]>`

### Interfaces

#### RetryOptions

**Properties**:

- `maxRetries: number` - 
- `delay: number` - 
- `backoff: 'linear' | 'exponential'` - 
- `backoffFactor: number` - 
- `shouldRetry: (error: any, attempt: number) => boolean` - 

#### TimeoutOptions

**Properties**:

- `signal: AbortSignal` - 

#### RateLimiterOptions

**Properties**:

- `maxConcurrent: number` - 
- `interval: number` - 
- `maxPerInterval: number` - 


## datetime

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/datetime.ts`

### Classes

#### DateTime

**Properties**:

- `date: Date` - 
- `options: DateTimeOptions` - 

**Methods**:

##### now

**Signature**: `static now(): DateTime`

##### today

**Signature**: `static today(): DateTime`

##### tomorrow

**Signature**: `static tomorrow(): DateTime`

##### yesterday

**Signature**: `static yesterday(): DateTime`

##### fromTimestamp

**Signature**: `static fromTimestamp(timestamp: number): DateTime`

##### fromISO

**Signature**: `static fromISO(isoString: string): DateTime`

##### parse

**Signature**: `static parse(dateString: string, format?: string): DateTime`

##### add

**Signature**: `add(amount: number, unit: TimeUnit): DateTime`

##### subtract

**Signature**: `subtract(amount: number, unit: TimeUnit): DateTime`

##### isBefore

**Signature**: `isBefore(other: DateTime): boolean`

##### isAfter

**Signature**: `isAfter(other: DateTime): boolean`

##### isSame

**Signature**: `isSame(other: DateTime, precision: TimeUnit = 'milliseconds'): boolean`

##### isBetween

**Signature**: `isBetween(start: DateTime, end: DateTime, inclusive: boolean = false): boolean`

##### diff

**Signature**: `diff(other: DateTime, unit: TimeUnit = 'milliseconds'): number`

##### duration

**Signature**: `duration(other: DateTime): Duration`

##### format

**Signature**: `format(pattern?: string): string`

##### toISO

**Signature**: `toISO(): string`

##### toDateString

**Signature**: `toDateString(): string`

##### toTimeString

**Signature**: `toTimeString(): string`

##### toJSON

**Signature**: `toJSON(): string`

##### toString

**Signature**: `toString(): string`

##### setYear

**Signature**: `setYear(year: number): DateTime`

##### setMonth

**Signature**: `setMonth(month: number): DateTime`

##### setDay

**Signature**: `setDay(day: number): DateTime`

##### setHour

**Signature**: `setHour(hour: number): DateTime`

##### setMinute

**Signature**: `setMinute(minute: number): DateTime`

##### setSecond

**Signature**: `setSecond(second: number): DateTime`

##### startOf

**Signature**: `startOf(unit: TimeUnit): DateTime`

##### endOf

**Signature**: `endOf(unit: TimeUnit): DateTime`

##### isLeapYear

**Signature**: `isLeapYear(): boolean`

##### daysInMonth

**Signature**: `daysInMonth(): number`

##### clone

**Signature**: `clone(): DateTime`

##### utc

**Signature**: `utc(): DateTime`

##### local

**Signature**: `local(): DateTime`

##### timezone

**Signature**: `timezone(tz: string): DateTime`

##### isValid

**Signature**: `isValid(): boolean`

##### isToday

**Signature**: `isToday(): boolean`

##### isYesterday

**Signature**: `isYesterday(): boolean`

##### isTomorrow

**Signature**: `isTomorrow(): boolean`

##### isWeekend

**Signature**: `isWeekend(): boolean`

##### isWeekday

**Signature**: `isWeekday(): boolean`

##### isLeapYear

**Signature**: `static isLeapYear(year: number): boolean`

##### daysInMonth

**Signature**: `static daysInMonth(year: number, month: number): number`

##### max

**Signature**: `static max(...dates: DateTime[]): DateTime`

##### min

**Signature**: `static min(...dates: DateTime[]): DateTime`

#### DateTimeUtils

**Methods**:

##### sleep

**Signature**: `static sleep(ms: number): Promise<void>`

##### timeout

**Signature**: `static timeout<T>(promise: Promise<T>, ms: number): Promise<T>`

##### formatDuration

**Signature**: `static formatDuration(duration: Duration): string`

##### humanizeDuration

**Signature**: `static humanizeDuration(ms: number): string`

### Interfaces

#### DateTimeOptions

**Properties**:

- `locale: string` - 
- `timezone: string` - 

#### Duration

**Properties**:

- `years: number` - 
- `months: number` - 
- `weeks: number` - 
- `days: number` - 
- `hours: number` - 
- `minutes: number` - 
- `seconds: number` - 
- `milliseconds: number` - 


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


## audio

**File**: `src/stdlib/audio.ts`

### Classes

#### AudioUtils

**Methods**:

##### createBuffer

**Signature**: `static createBuffer(duration: number, sampleRate: number = 44100, channels: number = 2): AudioBuffer`

##### clone

**Signature**: `static clone(buffer: AudioBuffer): AudioBuffer`

##### mixBuffers

**Signature**: `static mixBuffers(buffer1: AudioBuffer, buffer2: AudioBuffer, ratio: number = 0.5): AudioBuffer`

##### concatenate

**Signature**: `static concatenate(buffers: AudioBuffer[]): AudioBuffer`

##### normalize

**Signature**: `static normalize(buffer: AudioBuffer, targetLevel: number = 1.0): AudioBuffer`

##### fadeIn

**Signature**: `static fadeIn(buffer: AudioBuffer, duration: number): AudioBuffer`

##### fadeOut

**Signature**: `static fadeOut(buffer: AudioBuffer, duration: number): AudioBuffer`

#### Synthesizer

**Properties**:

- `oscillators: Map<string, Oscillator>` - 
- `sampleRate: number` - 

**Methods**:

##### createOscillator

**Signature**: `createOscillator(id: string, type: Oscillator['type'], frequency: number, amplitude: number = 1.0): void`

##### removeOscillator

**Signature**: `removeOscillator(id: string): boolean`

##### generateTone

**Signature**: `generateTone(frequency: number, duration: number, type: Oscillator['type'] = 'sine', amplitude: number = 0.5): AudioBuffer`

##### generateChord

**Signature**: `generateChord(frequencies: number[], duration: number, type: Oscillator['type'] = 'sine', amplitude: number = 0.5): AudioBuffer`

##### generateSequence

**Signature**: `generateSequence(notes:`

##### generateNoise

**Signature**: `generateNoise(duration: number, type: 'white' | 'pink' | 'brown' = 'white', amplitude: number = 0.5): AudioBuffer`

##### generateSample

**Signature**: `private generateSample(type: Oscillator['type'], frequency: number, time: number): number`

##### generateEnvelope

**Signature**: `generateEnvelope(duration: number, attack: number, decay: number, sustain: number, release: number): Float32Array`

##### applyEnvelope

**Signature**: `applyEnvelope(buffer: AudioBuffer, envelope: Float32Array): AudioBuffer`

#### ReverbEffect

**Implements**: `AudioEffect`

**Properties**:

- `name: any` - 

**Methods**:

##### apply

**Signature**: `apply(buffer: AudioBuffer, params:`

#### DelayEffect

**Implements**: `AudioEffect`

**Properties**:

- `name: any` - 

**Methods**:

##### apply

**Signature**: `apply(buffer: AudioBuffer, params:`

#### FilterEffect

**Implements**: `AudioEffect`

**Properties**:

- `name: any` - 

**Methods**:

##### apply

**Signature**: `apply(buffer: AudioBuffer, params:`

#### DistortionEffect

**Implements**: `AudioEffect`

**Properties**:

- `name: any` - 

**Methods**:

##### apply

**Signature**: `apply(buffer: AudioBuffer, params:`

#### AudioAnalyzer

**Methods**:

##### analyzeBuffer

**Signature**: `static analyzeBuffer(buffer: AudioBuffer): AnalysisResult`

##### performFFT

**Signature**: `private static performFFT(signal: Float32Array): Float32Array`

##### reverseBits

**Signature**: `private static reverseBits(num: number, bits: number): number`

#### AudioProcessor

**Properties**:

- `effects: AudioEffect[]` - 
- `config: AudioConfig` - 

**Methods**:

##### addEffect

**Signature**: `addEffect(effect: AudioEffect): void`

##### removeEffect

**Signature**: `removeEffect(name: string): boolean`

##### process

**Signature**: `process(buffer: AudioBuffer, effectParams?: Record<string, Record<string, number>>): AudioBuffer`

##### getConfig

**Signature**: `getConfig(): AudioConfig`

##### setConfig

**Signature**: `setConfig(config: Partial<AudioConfig>): void`

#### Audio

**Properties**:

- `Notes: any` - 

**Methods**:

##### createSynthesizer

**Signature**: `static createSynthesizer(sampleRate?: number): Synthesizer`

##### createProcessor

**Signature**: `static createProcessor(config?: AudioConfig): AudioProcessor`

##### createBuffer

**Signature**: `static createBuffer(duration: number, sampleRate?: number, channels?: number): AudioBuffer`

##### analyze

**Signature**: `static analyze(buffer: AudioBuffer): AnalysisResult`

##### midiToFrequency

**Signature**: `static midiToFrequency(midiNote: number): number`

##### frequencyToMidi

**Signature**: `static frequencyToMidi(frequency: number): number`

### Interfaces

#### AudioConfig

**Properties**:

- `sampleRate: number` - 
- `channels: number` - 
- `bitDepth: 8 | 16 | 24 | 32` - 
- `bufferSize: number` - 

#### AudioBuffer

**Properties**:

- `data: Float32Array[]` - 
- `sampleRate: number` - 
- `duration: number` - 
- `channels: number` - 

#### Oscillator

**Properties**:

- `type: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise'` - 
- `frequency: number` - 
- `amplitude: number` - 
- `phase: number` - 

#### AudioEffect

**Properties**:

- `name: string` - 

**Methods**:

##### apply

**Signature**: `apply(buffer: AudioBuffer, params?: Record<string, number>): AudioBuffer;`

#### AnalysisResult

**Properties**:

- `rms: number` - 
- `peak: number` - 
- `frequency: number[]` - 
- `magnitude: number[]` - 
- `spectralCentroid: number` - 
- `zeroCrossingRate: number` - 


## cache

**File**: `src/stdlib/cache.ts`

### Classes

#### BaseCache

**Properties**:

- `stats: CacheStats` - 
- `defaultOptions: CacheOptions` - 

**Methods**:

##### get

**Signature**: `abstract get(key: string): Promise<T | null>;`

##### set

**Signature**: `abstract set(key: string, value: T, options?: CacheOptions): Promise<void>;`

##### delete

**Signature**: `abstract delete(key: string): Promise<boolean>;`

##### clear

**Signature**: `abstract clear(): Promise<void>;`

##### keys

**Signature**: `abstract keys(): Promise<string[]>;`

##### has

**Signature**: `async has(key: string): Promise<boolean>`

##### getStats

**Signature**: `getStats(): CacheStats`

##### resetStats

**Signature**: `resetStats(): void`

##### updateHitRate

**Signature**: `protected updateHitRate(): void`

##### isExpired

**Signature**: `protected isExpired(entry: CacheEntry<T>): boolean`

##### calculateSize

**Signature**: `protected calculateSize(value: T): number`

##### mget

**Signature**: `async mget(keys: string[]): Promise<Record<string, T | null>>`

##### mset

**Signature**: `async mset(entries: Record<string, T>, options?: CacheOptions): Promise<void>`

##### deleteByTag

**Signature**: `async deleteByTag(tag: string): Promise<number>`

##### getEntry

**Signature**: `protected abstract getEntry(key: string): Promise<CacheEntry<T> | null>;`

#### MemoryCache

**Extends**: `BaseCache`

**Properties**:

- `storage: any` - 
- `accessOrder: any` - 

**Methods**:

##### get

**Signature**: `async get(key: string): Promise<T | null>`

##### set

**Signature**: `async set(key: string, value: T, options?: CacheOptions): Promise<void>`

##### delete

**Signature**: `async delete(key: string): Promise<boolean>`

##### clear

**Signature**: `async clear(): Promise<void>`

##### keys

**Signature**: `async keys(): Promise<string[]>`

##### getEntry

**Signature**: `protected async getEntry(key: string): Promise<CacheEntry<T> | null>`

##### evictIfNeeded

**Signature**: `private async evictIfNeeded(newEntrySize: number): Promise<void>`

##### evictExpired

**Signature**: `private async evictExpired(): Promise<void>`

##### evictLRU

**Signature**: `private async evictLRU(count: number): Promise<void>`

#### TieredCache

**Extends**: `BaseCache`

**Methods**:

##### get

**Signature**: `async get(key: string): Promise<T | null>`

##### set

**Signature**: `async set(key: string, value: T, options?: CacheOptions): Promise<void>`

##### delete

**Signature**: `async delete(key: string): Promise<boolean>`

##### clear

**Signature**: `async clear(): Promise<void>`

##### keys

**Signature**: `async keys(): Promise<string[]>`

##### getEntry

**Signature**: `protected async getEntry(key: string): Promise<CacheEntry<T> | null>`

##### getStats

**Signature**: `getStats(): CacheStats`

#### Memoizer

**Properties**:

- `cache: BaseCache<T>` - 

**Methods**:

##### memoize

**Signature**: `memoize<F extends (...args: any[]) => any>(
    fn: F,
    keyGenerator?: (...args: Parameters<F>) => string
  ): F`

##### clear

**Signature**: `clear(): Promise<void>`

##### getStats

**Signature**: `getStats(): CacheStats`

#### WriteThroughCache

**Extends**: `BaseCache`

**Methods**:

##### get

**Signature**: `async get(key: string): Promise<T | null>`

##### set

**Signature**: `async set(key: string, value: T, options?: CacheOptions): Promise<void>`

##### delete

**Signature**: `async delete(key: string): Promise<boolean>`

##### clear

**Signature**: `async clear(): Promise<void>`

##### keys

**Signature**: `async keys(): Promise<string[]>`

##### getEntry

**Signature**: `protected async getEntry(key: string): Promise<CacheEntry<T> | null>`

#### WriteBehindCache

**Extends**: `BaseCache`

**Properties**:

- `writeQueue: any` - 
- `writeTimer: NodeJS.Timeout | null` - 

**Methods**:

##### get

**Signature**: `async get(key: string): Promise<T | null>`

##### set

**Signature**: `async set(key: string, value: T, options?: CacheOptions): Promise<void>`

##### delete

**Signature**: `async delete(key: string): Promise<boolean>`

##### clear

**Signature**: `async clear(): Promise<void>`

##### keys

**Signature**: `async keys(): Promise<string[]>`

##### getEntry

**Signature**: `protected async getEntry(key: string): Promise<CacheEntry<T> | null>`

##### flush

**Signature**: `async flush(): Promise<void>`

##### startWriteTimer

**Signature**: `private startWriteTimer(): void`

##### close

**Signature**: `async close(): Promise<void>`

#### CacheFactory

**Methods**:

##### createMemoryCache

**Signature**: `static createMemoryCache<T = any>(options?: CacheOptions): MemoryCache<T>`

##### createTieredCache

**Signature**: `static createTieredCache<T = any>(options?: CacheOptions): TieredCache<T>`

##### createMemoizer

**Signature**: `static createMemoizer<T = any>(maxSize = 100): Memoizer<T>`

### Interfaces

#### CacheEntry

**Properties**:

- `value: T` - 
- `createdAt: DateTime` - 
- `expiresAt: DateTime` - 
- `accessCount: number` - 
- `lastAccessed: DateTime` - 
- `size: number` - 
- `tags: string[]` - 

#### CacheOptions

**Properties**:

- `ttl: number` - 
- `maxSize: number` - 
- `maxMemory: number` - 
- `tags: string[]` - 
- `serialize: boolean` - 

#### CacheStats

**Properties**:

- `hits: number` - 
- `misses: number` - 
- `size: number` - 
- `memory: number` - 
- `hitRate: number` - 
- `evictions: number` - 

#### CacheStorage

**Methods**:

##### get

**Signature**: `get(key: string): Promise<CacheEntry<T> | null>;`

##### set

**Signature**: `set(key: string, entry: CacheEntry<T>): Promise<void>;`

##### delete

**Signature**: `delete(key: string): Promise<boolean>;`

##### clear

**Signature**: `clear(): Promise<void>;`

##### keys

**Signature**: `keys(): Promise<string[]>;`

##### size

**Signature**: `size(): Promise<number>;`

### Functions

#### cached

**Signature**: `export function cached<T extends (...args: any[]) => any>(
  cache: BaseCache,
  options:`


## collections

**File**: `src/stdlib/collections.ts`

### Classes

#### List

**Properties**:

- `items: T[]` - 
- `lock: any` - 

**Methods**:

##### push

**Signature**: `async push(item: T): Promise<void>`

##### tryPush

**Signature**: `async tryPush(item: T): Promise<Result<void, Error>>`

##### pop

**Signature**: `pop(): T | undefined`

##### filter

**Signature**: `async filter(predicate: (item: T) => boolean): Promise<List<T>>`

##### toArray

**Signature**: `async toArray(): Promise<T[]>`

##### map

**Signature**: `async map<R>(mapper: (item: T, index: number) => R): Promise<List<R>>`

##### reduce

**Signature**: `async reduce<R>(reducer: (acc: R, item: T, index: number) => R, initialValue: R): Promise<R>`

##### at

**Signature**: `async at(index: number): Promise<T | undefined>`

##### indexOf

**Signature**: `async indexOf(item: T): Promise<number>`

##### includes

**Signature**: `async includes(item: T): Promise<boolean>`

##### slice

**Signature**: `async slice(start?: number, end?: number): Promise<List<T>>`

##### reverse

**Signature**: `async reverse(): Promise<List<T>>`

##### sort

**Signature**: `async sort(compareFn?: (a: T, b: T) => number): Promise<List<T>>`

##### find

**Signature**: `async find(predicate: (item: T, index: number) => boolean): Promise<T | undefined>`

##### findIndex

**Signature**: `async findIndex(predicate: (item: T, index: number) => boolean): Promise<number>`

##### some

**Signature**: `async some(predicate: (item: T, index: number) => boolean): Promise<boolean>`

##### every

**Signature**: `async every(predicate: (item: T, index: number) => boolean): Promise<boolean>`

##### flatMap

**Signature**: `async flatMap<R>(mapper: (item: T, index: number) => R[]): Promise<List<R>>`

##### groupBy

**Signature**: `async groupBy<K>(keySelector: (item: T) => K): Promise<Map<K, List<T>>>`

##### partition

**Signature**: `async partition(predicate: (item: T) => boolean): Promise<[List<T>, List<T>]>`

##### take

**Signature**: `async take(count: number): Promise<List<T>>`

##### drop

**Signature**: `async drop(count: number): Promise<List<T>>`

##### takeWhile

**Signature**: `async takeWhile(predicate: (item: T) => boolean): Promise<List<T>>`

##### dropWhile

**Signature**: `async dropWhile(predicate: (item: T) => boolean): Promise<List<T>>`

##### unique

**Signature**: `async unique(keySelector?: (item: T) => any): Promise<List<T>>`

##### zip

**Signature**: `async zip<U>(other: List<U>): Promise<List<[T, U]>>`

##### isEmpty

**Signature**: `async isEmpty(): Promise<boolean>`

##### count

**Signature**: `async count(predicate?: (item: T) => boolean): Promise<number>`

##### min

**Signature**: `async min(compareFn?: (a: T, b: T) => number): Promise<T | undefined>`

##### max

**Signature**: `async max(compareFn?: (a: T, b: T) => number): Promise<T | undefined>`

#### Map

**Properties**:

- `_items: any` - 
- `lock: any` - 

**Methods**:

##### set

**Signature**: `async set(key: K, value: V): Promise<void>`

##### get

**Signature**: `async get(key: K): Promise<V | undefined>`

##### entries

**Signature**: `async entries(): Promise<[K, V][]>`

##### clear

**Signature**: `async clear(): Promise<void>`

#### Mutex

**Properties**:

- `promise: Promise<void>` - 

**Methods**:

##### acquire

**Signature**: `async acquire(): Promise<void>`

##### release

**Signature**: `release(): void`

##### acquireWithTimeout

**Signature**: `async acquireWithTimeout(timeoutMs: number): Promise<boolean>`

#### Set

**Properties**:

- `items: any` - 
- `lock: any` - 

**Methods**:

##### add

**Signature**: `async add(item: T): Promise<void>`

##### has

**Signature**: `async has(item: T): Promise<boolean>`

##### delete

**Signature**: `async delete(item: T): Promise<boolean>`

##### clear

**Signature**: `async clear(): Promise<void>`

##### toArray

**Signature**: `async toArray(): Promise<T[]>`

##### union

**Signature**: `async union(other: Set<T>): Promise<Set<T>>`

##### intersection

**Signature**: `async intersection(other: Set<T>): Promise<Set<T>>`

##### difference

**Signature**: `async difference(other: Set<T>): Promise<Set<T>>`

#### PriorityQueue

**Properties**:

- `heap: Array<{ item: T; priority: number }>` - 
- `lock: any` - 

**Methods**:

##### enqueue

**Signature**: `async enqueue(item: T, priority: number): Promise<void>`

##### dequeue

**Signature**: `async dequeue(): Promise<T | undefined>`

##### peek

**Signature**: `async peek(): Promise<T | undefined>`

##### heapifyUp

**Signature**: `private heapifyUp(index: number): void`

##### heapifyDown

**Signature**: `private heapifyDown(index: number): void`

#### Graph

**Properties**:

- `nodes: any` - 
- `adjacencyList: any` - 
- `edges: any` - 
- `lock: any` - 

**Methods**:

##### addNode

**Signature**: `async addNode(id: string, data: T): Promise<void>`

##### addEdge

**Signature**: `async addEdge(from: string, to: string, weight?: number): Promise<void>`

##### getNode

**Signature**: `async getNode(id: string): Promise<GraphNode<T> | undefined>`

##### getNeighbors

**Signature**: `async getNeighbors(nodeId: string): Promise<string[]>`

##### hasPath

**Signature**: `async hasPath(from: string, to: string): Promise<boolean>`

##### shortestPath

**Signature**: `async shortestPath(from: string, to: string): Promise<string[] | null>`

##### getAllNodes

**Signature**: `async getAllNodes(): Promise<GraphNode<T>[]>`

##### getAllEdges

**Signature**: `async getAllEdges(): Promise<GraphEdge[]>`

#### TreeNode

#### BinarySearchTree

**Properties**:

- `root: TreeNode<T> | null` - 
- `lock: any` - 
- `compareFn: (a: T, b: T) => number` - 

**Methods**:

##### insert

**Signature**: `async insert(value: T): Promise<void>`

##### insertNode

**Signature**: `private insertNode(node: TreeNode<T> | null, value: T): TreeNode<T>`

##### search

**Signature**: `async search(value: T): Promise<boolean>`

##### searchNode

**Signature**: `private searchNode(node: TreeNode<T> | null, value: T): boolean`

##### inorderTraversal

**Signature**: `async inorderTraversal(): Promise<T[]>`

##### inorderHelper

**Signature**: `private inorderHelper(node: TreeNode<T> | null, result: T[]): void`

##### preorderTraversal

**Signature**: `async preorderTraversal(): Promise<T[]>`

##### preorderHelper

**Signature**: `private preorderHelper(node: TreeNode<T> | null, result: T[]): void`

##### postorderTraversal

**Signature**: `async postorderTraversal(): Promise<T[]>`

##### postorderHelper

**Signature**: `private postorderHelper(node: TreeNode<T> | null, result: T[]): void`

##### min

**Signature**: `async min(): Promise<T | null>`

##### findMin

**Signature**: `private findMin(node: TreeNode<T> | null): TreeNode<T> | null`

##### max

**Signature**: `async max(): Promise<T | null>`

##### findMax

**Signature**: `private findMax(node: TreeNode<T> | null): TreeNode<T> | null`

### Interfaces

#### GraphNode

**Properties**:

- `id: string` - 
- `data: T` - 

#### GraphEdge

**Properties**:

- `from: string` - 
- `to: string` - 
- `weight: number` - 


## validation

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/validation.ts`

### Classes

#### Validator

**Properties**:

- `rules: Map<string, ValidatorFunction[]>` - 
- `transforms: Map<string, ((value: any) => any)[]>` - 

**Methods**:

##### string

**Signature**: `static string(options:`

##### number

**Signature**: `static number(options:`

##### boolean

**Signature**: `static boolean(): ValidatorFunction<boolean>`

##### array

**Signature**: `static array<T>(itemValidator?: ValidatorFunction<T>, options:`

##### object

**Signature**: `static object(schema: Record<string, ValidatorFunction>): ValidatorFunction<Record<string, any>>`

##### email

**Signature**: `static email(): ValidatorFunction<string>`

##### url

**Signature**: `static url(): ValidatorFunction<string>`

##### date

**Signature**: `static date(): ValidatorFunction<Date>`

##### enum

**Signature**: `static enum<T extends string | number>(allowedValues: T[]): ValidatorFunction<T>`

##### optional

**Signature**: `static optional<T>(validator: ValidatorFunction<T>): ValidatorFunction<T | undefined>`

##### required

**Signature**: `static required<T>(validator: ValidatorFunction<T>): ValidatorFunction<T>`

##### oneOf

**Signature**: `static oneOf<T>(...validators: ValidatorFunction<T>[]): ValidatorFunction<T>`

##### allOf

**Signature**: `static allOf<T>(...validators: ValidatorFunction<T>[]): ValidatorFunction<T>`

##### field

**Signature**: `field(fieldName: string): FieldValidator`

##### addRule

**Signature**: `addRule(field: string, validator: ValidatorFunction): this`

##### addTransform

**Signature**: `addTransform(field: string, transform: (value: any) => any): this`

##### validate

**Signature**: `validate(data: Record<string, any>): ValidationResult`

#### FieldValidator

**Methods**:

##### string

**Signature**: `string(options?: Parameters<typeof Validator.string>[0]): this`

##### number

**Signature**: `number(options?: Parameters<typeof Validator.number>[0]): this`

##### boolean

**Signature**: `boolean(): this`

##### email

**Signature**: `email(): this`

##### url

**Signature**: `url(): this`

##### date

**Signature**: `date(): this`

##### enum

**Signature**: `enum<T extends string | number>(values: T[]): this`

##### required

**Signature**: `required(): this`

##### optional

**Signature**: `optional(): this`

##### transform

**Signature**: `transform(fn: (value: any) => any): this`

##### custom

**Signature**: `custom(validator: ValidatorFunction): this`

#### Sanitizer

**Methods**:

##### escapeHtml

**Signature**: `static escapeHtml(input: string): string`

##### stripTags

**Signature**: `static stripTags(input: string): string`

##### normalizeWhitespace

**Signature**: `static normalizeWhitespace(input: string): string`

##### removeSpecialChars

**Signature**: `static removeSpecialChars(input: string, allowed: string = ''): string`

##### truncate

**Signature**: `static truncate(input: string, maxLength: number, suffix: string = '...'): string`

##### slug

**Signature**: `static slug(input: string): string`

### Interfaces

#### ValidationError

**Properties**:

- `field: string` - 
- `message: string` - 
- `code: string` - 
- `value: any` - 

#### ValidationResult

**Properties**:

- `isValid: boolean` - 
- `errors: ValidationError[]` - 
- `sanitizedValue: any` - 


## serialization

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/serialization.ts`

### Classes

#### BaseSerializer

**Methods**:

##### serialize

**Signature**: `abstract serialize(data: any, options?: SerializationOptions): SerializationResult;`

##### deserialize

**Signature**: `abstract deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T>;`

##### getContentType

**Signature**: `abstract getContentType(): string;`

##### getFileExtension

**Signature**: `abstract getFileExtension(): string;`

#### JsonSerializer

**Extends**: `BaseSerializer`

**Properties**:

- `CONTENT_TYPE: any` - 
- `EXTENSION: any` - 

**Methods**:

##### serialize

**Signature**: `serialize(data: any, options?: SerializationOptions): SerializationResult`

##### deserialize

**Signature**: `deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T>`

##### getContentType

**Signature**: `getContentType(): string`

##### getFileExtension

**Signature**: `getFileExtension(): string`

##### createReplacer

**Signature**: `private createReplacer(): (key: string, value: any) => any`

##### createReviver

**Signature**: `private createReviver(): (key: string, value: any) => any`

#### XmlSerializer

**Extends**: `BaseSerializer`

**Properties**:

- `CONTENT_TYPE: any` - 
- `EXTENSION: any` - 

**Methods**:

##### serialize

**Signature**: `serialize(data: any, options?: SerializationOptions): SerializationResult`

##### deserialize

**Signature**: `deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T>`

##### getContentType

**Signature**: `getContentType(): string`

##### getFileExtension

**Signature**: `getFileExtension(): string`

##### objectToXml

**Signature**: `private objectToXml(obj: any, options:`

##### xmlToObject

**Signature**: `private xmlToObject(xmlString: string): any`

##### parseXmlContent

**Signature**: `private parseXmlContent(content: string): any`

##### parseXmlArray

**Signature**: `private parseXmlArray(content: string): any[]`

##### extractElements

**Signature**: `private extractElements(content: string): string[]`

##### sanitizeXmlTag

**Signature**: `private sanitizeXmlTag(tag: string): string`

##### escapeXml

**Signature**: `private escapeXml(text: string): string`

##### unescapeXml

**Signature**: `private unescapeXml(text: string): string`

#### YamlSerializer

**Extends**: `BaseSerializer`

**Properties**:

- `CONTENT_TYPE: any` - 
- `EXTENSION: any` - 

**Methods**:

##### serialize

**Signature**: `serialize(data: any, options?: SerializationOptions): SerializationResult`

##### deserialize

**Signature**: `deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T>`

##### getContentType

**Signature**: `getContentType(): string`

##### getFileExtension

**Signature**: `getFileExtension(): string`

##### objectToYaml

**Signature**: `private objectToYaml(obj: any, depth: number): string`

##### yamlToObject

**Signature**: `private yamlToObject(yamlString: string): any`

##### parseYamlLines

**Signature**: `private parseYamlLines(lines: string[], startIndex: number):`

##### parseYamlValue

**Signature**: `private parseYamlValue(value: string): any`

#### BinarySerializer

**Extends**: `BaseSerializer`

**Properties**:

- `CONTENT_TYPE: any` - 
- `EXTENSION: any` - 

**Methods**:

##### serialize

**Signature**: `serialize(data: any, options?: SerializationOptions): SerializationResult`

##### deserialize

**Signature**: `deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T>`

##### getContentType

**Signature**: `getContentType(): string`

##### getFileExtension

**Signature**: `getFileExtension(): string`

##### serializeToBinary

**Signature**: `private serializeToBinary(data: any): Uint8Array`

##### writeValue

**Signature**: `private writeValue(value: any, chunks: number[]): void`

##### writeLength

**Signature**: `private writeLength(length: number, chunks: number[]): void`

##### deserializeFromBinary

**Signature**: `private deserializeFromBinary(buffer: Uint8Array): any`

##### readValue

**Signature**: `private readValue(buffer: Uint8Array, context:`

##### readLength

**Signature**: `private readLength(buffer: Uint8Array, context:`

#### Serialization

**Properties**:

- `serializers: any` - 

**Methods**:

##### serialize

**Signature**: `static serialize(data: any, format: string = 'json', options?: SerializationOptions): SerializationResult`

##### deserialize

**Signature**: `static deserialize<T = any>(
    serialized: string | Uint8Array, 
    format: string = 'json', 
    options?: SerializationOptions
  ): DeserializationResult<T>`

##### registerSerializer

**Signature**: `static registerSerializer(format: string, serializer: BaseSerializer): void`

##### getAvailableFormats

**Signature**: `static getAvailableFormats(): string[]`

##### getContentType

**Signature**: `static getContentType(format: string): string`

##### getFileExtension

**Signature**: `static getFileExtension(format: string): string`

##### clone

**Signature**: `static clone<T>(obj: T, format: string = 'json'): T`

##### compare

**Signature**: `static compare(obj1: any, obj2: any, format: string = 'json'): boolean`

##### compress

**Signature**: `static compress(data: string | Uint8Array, algorithm: 'gzip' | 'deflate' = 'gzip'): Uint8Array`

##### decompress

**Signature**: `static decompress(data: Uint8Array, algorithm: 'gzip' | 'deflate' = 'gzip'): Uint8Array`

### Interfaces

#### SerializationOptions

**Properties**:

- `format: 'json' | 'xml' | 'yaml' | 'msgpack' | 'protobuf'` - 
- `pretty: boolean` - 
- `strict: boolean` - 
- `schema: any` - 
- `encoding: 'utf8' | 'base64' | 'hex'` - 

#### SerializationResult

**Properties**:

- `data: string | Uint8Array` - 
- `format: string` - 
- `size: number` - 
- `metadata: Record<string, any>` - 

#### DeserializationResult

**Properties**:

- `data: T` - 
- `format: string` - 
- `isValid: boolean` - 
- `errors: string[]` - 


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


## crypto

**File**: `src/stdlib/crypto.ts`

### Classes

#### Crypto

**Methods**:

##### hash

**Signature**: `static async hash(data: string, algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256'): Promise<string>`

##### md5

**Signature**: `static async md5(data: string): Promise<string>`

##### hmac

**Signature**: `static async hmac(data: string, key: string, algorithm: 'SHA-256' | 'SHA-512' = 'SHA-256'): Promise<string>`

##### encrypt

**Signature**: `static async encrypt(data: string, key: string, algorithm: 'AES-GCM' | 'AES-CBC' = 'AES-GCM'): Promise<EncryptionResult>`

##### decrypt

**Signature**: `static async decrypt(encryptionResult: EncryptionResult, key: string): Promise<string>`

##### generateKey

**Signature**: `static async generateKey(length: number = 32): Promise<string>`

##### generateKeyPair

**Signature**: `static async generateKeyPair(algorithm: 'RSA-OAEP' | 'ECDSA' = 'RSA-OAEP'): Promise<KeyPair>`

##### sign

**Signature**: `static async sign(data: string, privateKey: string, algorithm: 'ECDSA' | 'RSA-PSS' = 'ECDSA'): Promise<string>`

##### verify

**Signature**: `static async verify(data: string, signature: string, publicKey: string, algorithm: 'ECDSA' | 'RSA-PSS' = 'ECDSA'): Promise<boolean>`

##### generateRandomBytes

**Signature**: `static generateRandomBytes(length: number): Uint8Array`

##### generateRandomString

**Signature**: `static generateRandomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string`

##### generateUUID

**Signature**: `static generateUUID(): string`

##### deriveKey

**Signature**: `static async deriveKey(password: string, salt: string, iterations: number = 100000): Promise<string>`

##### generateSalt

**Signature**: `static generateSalt(length: number = 16): string`

##### bufferToBase64

**Signature**: `private static bufferToBase64(buffer: ArrayBuffer): string`

##### base64ToBuffer

**Signature**: `private static base64ToBuffer(base64: string): ArrayBuffer`

##### arrayToBase64

**Signature**: `private static arrayToBase64(array: Uint8Array): string`

##### base64ToArray

**Signature**: `private static base64ToArray(base64: string): Uint8Array`

##### simpleMD5

**Signature**: `private static simpleMD5(data: string): string`

### Interfaces

#### EncryptionResult

**Properties**:

- `encrypted: string` - 
- `iv: string` - 
- `algorithm: string` - 

#### KeyPair

**Properties**:

- `publicKey: string` - 
- `privateKey: string` - 


## encoding

**File**: `src/stdlib/encoding.ts`

### Classes

#### Encoding

**Methods**:

##### toBase64

Encode string to Base64

**Signature**: `static toBase64(input: string): string`

##### fromBase64

Decode Base64 to string

**Signature**: `static fromBase64(input: string): string`

##### urlEncode

URL encode (percent encoding)

**Signature**: `static urlEncode(input: string): string`

##### urlDecode

URL decode

**Signature**: `static urlDecode(input: string): string`

##### htmlEncode

HTML encode (escape HTML entities)

**Signature**: `static htmlEncode(input: string): string`

##### htmlDecode

HTML decode (unescape HTML entities)

**Signature**: `static htmlDecode(input: string): string`

##### toHex

Hex encode

**Signature**: `static toHex(input: string): string`

##### fromHex

Hex decode

**Signature**: `static fromHex(input: string): string`

##### toBinary

Binary encode (string to binary representation)

**Signature**: `static toBinary(input: string): string`

##### fromBinary

Binary decode (binary representation to string)

**Signature**: `static fromBinary(input: string): string`

##### toUnicodeEscape

Unicode escape encoding

**Signature**: `static toUnicodeEscape(input: string): string`

##### fromUnicodeEscape

Unicode escape decoding

**Signature**: `static fromUnicodeEscape(input: string): string`

##### rot13

ROT13 encoding/decoding

**Signature**: `static rot13(input: string): string`

##### caesarEncode

Caesar cipher encoding

**Signature**: `static caesarEncode(input: string, shift: number): string`

##### caesarDecode

Caesar cipher decoding

**Signature**: `static caesarDecode(input: string, shift: number): string`

##### isValidBase64

Check if string is valid Base64

**Signature**: `static isValidBase64(input: string): boolean`

##### isValidHex

Check if string is valid hex

**Signature**: `static isValidHex(input: string): boolean`

##### isValidUrlEncoded

Check if string is valid URL encoding

**Signature**: `static isValidUrlEncoded(input: string): boolean`

##### analyze

Get encoding information about a string

**Signature**: `static analyze(input: string):`

##### base64Encode

**Signature**: `private static base64Encode(input: string): string`

##### base64Decode

**Signature**: `private static base64Decode(input: string): string`


## fs

**File**: `src/stdlib/fs.ts`

### Classes

#### FileSystem

**Methods**:

##### readFile

Read file contents as string

**Signature**: `static async readFile(path: string, encoding: string = 'utf8'): Promise<string>`

##### writeFile

Write string content to file

**Signature**: `static async writeFile(path: string, data: string, encoding: string = 'utf8'): Promise<void>`

##### appendFile

Append string content to file

**Signature**: `static async appendFile(path: string, data: string, encoding: string = 'utf8'): Promise<void>`

##### exists

Check if file or directory exists

**Signature**: `static async exists(path: string): Promise<boolean>`

##### stat

Get file/directory statistics

**Signature**: `static async stat(path: string): Promise<FileStats>`

##### mkdir

Create directory (and parent directories if needed)

**Signature**: `static async mkdir(path: string, recursive: boolean = false): Promise<void>`

##### remove

Remove file or directory

**Signature**: `static async remove(path: string, recursive: boolean = false): Promise<void>`

##### readDir

List directory contents

**Signature**: `static async readDir(path: string): Promise<DirectoryEntry[]>`

##### copy

Copy file from source to destination

**Signature**: `static async copy(source: string, destination: string): Promise<void>`

##### move

Move/rename file or directory

**Signature**: `static async move(source: string, destination: string): Promise<void>`

##### createReadStream

Create a readable stream for large files

**Signature**: `static createReadStream(path: string, options?:`

##### createWriteStream

Create a writable stream for large files

**Signature**: `static createWriteStream(path: string, options?:`

### Interfaces

#### FileStats

**Properties**:

- `size: number` - 
- `isFile: boolean` - 
- `isDirectory: boolean` - 
- `isSymbolicLink: boolean` - 
- `created: Date` - 
- `modified: Date` - 
- `accessed: Date` - 

#### DirectoryEntry

**Properties**:

- `name: string` - 
- `type: 'file' | 'directory' | 'symlink'` - 
- `size: number` - 


## genetic

**File**: `src/stdlib/genetic.ts`

### Classes

#### GeneticOptimizer

**Properties**:

- `options: Required<OptimizationOptions>` - 
- `population: Individual[]` - 
- `generation: number` - 
- `evaluationCount: number` - 
- `convergenceHistory: GenerationStats[]` - 
- `bestIndividual: Individual | null` - 
- `fitnessFunction: (params: number[]) => number | number[]` - 
- `isMultiObjective: boolean` - 

**Methods**:

##### setDefaultOptions

**Signature**: `private setDefaultOptions(options: OptimizationOptions): Required<OptimizationOptions>`

##### optimize

Main optimization function

**Signature**: `optimize(parameterCount: number): OptimizationResult`

##### initializePopulation

Initialize random population with parameter bounds

**Signature**: `private initializePopulation(parameterCount: number): void`

##### generateRandomParams

Generate random parameters within bounds

**Signature**: `private generateRandomParams(parameterCount: number): number[]`

##### satisfiesConstraints

Check if parameters satisfy all constraints

**Signature**: `private satisfiesConstraints(params: number[]): boolean`

##### checkMultiObjective

Determine if this is multi-objective optimization

**Signature**: `private checkMultiObjective(): void`

##### evaluateIndividual

Evaluate the fitness of an individual

**Signature**: `private evaluateIndividual(individual: Individual): number | number[]`

##### evaluatePopulation

Evaluate the entire population

**Signature**: `private evaluatePopulation(): void`

##### evolveGeneration

Create new generation through selection, crossover, and mutation

**Signature**: `private evolveGeneration(): void`

##### selectElite

Select elite individuals for next generation

**Signature**: `private selectElite(): Individual[]`

##### selectParent

Select a parent using the configured selection strategy

**Signature**: `private selectParent(): Individual`

##### rouletteSelection

Fitness-proportionate (roulette wheel) selection

**Signature**: `private rouletteSelection(): Individual`

##### tournamentSelection

Tournament selection

**Signature**: `private tournamentSelection(tournamentSize: number = 3): Individual`

##### rankSelection

Rank-based selection

**Signature**: `private rankSelection(): Individual`

##### crossover

Crossover operation between two parents

**Signature**: `private crossover(parent1: Individual, parent2: Individual): Individual[]`

##### uniformCrossover

Uniform crossover

**Signature**: `private uniformCrossover(parent1: Individual, parent2: Individual): Individual[]`

##### arithmeticCrossover

Arithmetic crossover (blending)

**Signature**: `private arithmeticCrossover(parent1: Individual, parent2: Individual): Individual[]`

##### blendCrossover

Blend crossover (BLX-α)

**Signature**: `private blendCrossover(parent1: Individual, parent2: Individual, alpha: number = 0.5): Individual[]`

##### mutate

Mutation operation

**Signature**: `private mutate(individual: Individual): void`

##### gaussianMutation

Gaussian mutation

**Signature**: `private gaussianMutation(individual: Individual, strength: number = 0.1): void`

##### uniformMutation

Uniform mutation

**Signature**: `private uniformMutation(individual: Individual, strength: number = 0.1): void`

##### polynomialMutation

Polynomial mutation

**Signature**: `private polynomialMutation(individual: Individual, eta: number = 20): void`

##### enforceConstraints

Enforce parameter bounds and constraints

**Signature**: `private enforceConstraints(individual: Individual): void`

##### updateStatistics

Update statistics for current generation

**Signature**: `private updateStatistics(): void`

##### calculateDiversity

Calculate population diversity

**Signature**: `private calculateDiversity(): number`

##### calculateConvergence

Calculate convergence metric

**Signature**: `private calculateConvergence(): number`

##### updateMutationRate

Update mutation rate based on population diversity (adaptive mutation)

**Signature**: `private updateMutationRate(): void`

##### shouldTerminate

Check termination conditions

**Signature**: `private shouldTerminate(): boolean`

##### sortPopulation

Sort population by fitness (descending)

**Signature**: `private sortPopulation(): Individual[]`

##### dominates

Check if individual a dominates individual b (for multi-objective)

**Signature**: `private dominates(a: Individual, b: Individual): boolean`

##### getBestIndividual

Get the best individual from a collection

**Signature**: `private getBestIndividual(individuals: Individual[]): Individual`

##### isBetter

Check if individual a is better than individual b

**Signature**: `private isBetter(a: Individual, b: Individual): boolean`

##### cloneIndividual

Clone an individual

**Signature**: `private cloneIndividual(individual: Individual): Individual`

##### euclideanDistance

Calculate Euclidean distance between two parameter vectors

**Signature**: `private euclideanDistance(params1: number[], params2: number[]): number`

##### generateId

Generate unique identifier for individuals

**Signature**: `private generateId(): string`

##### logProgress

Log optimization progress

**Signature**: `private logProgress(): void`

##### createResult

Create optimization result

**Signature**: `private createResult(): OptimizationResult`

### Interfaces

#### ParameterBounds

**Properties**:

- `min: number` - 
- `max: number` - 
- `type: 'continuous' | 'integer' | 'discrete'` - 
- `discreteValues: number[]` - 

#### OptimizationOptions

**Properties**:

- `populationSize: number` - 
- `maxGenerations: number` - 
- `mutationRate: number` - 
- `crossoverRate: number` - 
- `elitismCount: number` - 
- `targetFitness: number` - 
- `selectionStrategy: 'roulette' | 'tournament' | 'rank'` - 
- `crossoverStrategy: 'uniform' | 'arithmetic' | 'blend'` - 
- `mutationStrategy: 'gaussian' | 'uniform' | 'polynomial'` - 
- `adaptiveMutation: boolean` - 
- `verbose: boolean` - 
- `bounds: ParameterBounds[]` - 
- `constraints: Array<(params: number[]) => boolean>` - 

#### Individual

**Properties**:

- `params: number[]` - 
- `fitness: number | number[]` - 
- `age: number` - 
- `id: string` - 

#### GenerationStats

**Properties**:

- `generation: number` - 
- `bestFitness: number | number[]` - 
- `averageFitness: number | number[]` - 
- `worstFitness: number | number[]` - 
- `diversity: number` - 
- `mutationRate: number` - 
- `convergenceMetric: number` - 

#### OptimizationResult

**Properties**:

- `bestParams: number[]` - 
- `bestFitness: number | number[]` - 
- `generations: number` - 
- `convergenceHistory: GenerationStats[]` - 
- `finalPopulation: Individual[]` - 
- `totalEvaluations: number` - 

### Functions

#### optimize

Main optimization function for easy use

**Signature**: `export function optimize(
  fn: (params: number[]) => number | number[],
  options: OptimizationOptions &`


## graphics

**File**: `src/stdlib/graphics.ts`

### Classes

#### Canvas2D

**Implements**: `GraphicsContext`

**Properties**:

- `canvas: HTMLCanvasElement` - 
- `ctx: CanvasRenderingContext2D` - 
- `imageData: ImageData` - 
- `pixelData: Uint8ClampedArray` - 

**Methods**:

##### getCanvas

**Signature**: `getCanvas(): HTMLCanvasElement`

##### clear

**Signature**: `clear(color: Color =`

##### drawPixel

**Signature**: `drawPixel(x: number, y: number, color: Color): void`

##### drawLine

**Signature**: `drawLine(start: Point2D, end: Point2D, color: Color, thickness: number = 1): void`

##### drawRect

**Signature**: `drawRect(rect: Rect, color: Color, filled: boolean = false): void`

##### drawCircle

**Signature**: `drawCircle(circle: Circle, color: Color, filled: boolean = false): void`

##### drawText

**Signature**: `drawText(text: string, position: Point2D, color: Color, font: string = '16px Arial'): void`

##### drawImage

**Signature**: `drawImage(imageData: ImageData, position: Point2D, size?:`

##### flush

**Signature**: `flush(): void`

##### colorToString

**Signature**: `private colorToString(color: Color): string`

##### drawPolygon

**Signature**: `drawPolygon(points: Point2D[], color: Color, filled: boolean = false): void`

##### drawBezierCurve

**Signature**: `drawBezierCurve(start: Point2D, control1: Point2D, control2: Point2D, end: Point2D, color: Color): void`

##### drawGradient

**Signature**: `drawGradient(rect: Rect, colorStart: Color, colorEnd: Color, direction: 'horizontal' | 'vertical' = 'horizontal'): void`

#### SoftwareRenderer

**Implements**: `GraphicsContext`

**Properties**:

- `buffer: Uint8ClampedArray` - 

**Methods**:

##### getImageData

**Signature**: `getImageData(): ImageData`

##### getBuffer

**Signature**: `getBuffer(): Uint8ClampedArray`

##### clear

**Signature**: `clear(color: Color =`

##### drawPixel

**Signature**: `drawPixel(x: number, y: number, color: Color): void`

##### drawLine

**Signature**: `drawLine(start: Point2D, end: Point2D, color: Color, thickness: number = 1): void`

##### drawRect

**Signature**: `drawRect(rect: Rect, color: Color, filled: boolean = false): void`

##### drawCircle

**Signature**: `drawCircle(circle: Circle, color: Color, filled: boolean = false): void`

##### drawText

**Signature**: `drawText(text: string, position: Point2D, color: Color, font?: string): void`

##### drawImage

**Signature**: `drawImage(imageData: ImageData, position: Point2D, size?:`

#### Vector3

**Methods**:

##### add

**Signature**: `static add(a: Vector3, b: Vector3): Vector3`

##### subtract

**Signature**: `static subtract(a: Vector3, b: Vector3): Vector3`

##### scale

**Signature**: `static scale(v: Vector3, scalar: number): Vector3`

##### dot

**Signature**: `static dot(a: Vector3, b: Vector3): number`

##### cross

**Signature**: `static cross(a: Vector3, b: Vector3): Vector3`

##### magnitude

**Signature**: `static magnitude(v: Vector3): number`

##### normalize

**Signature**: `static normalize(v: Vector3): Vector3`

#### Matrix4

**Methods**:

##### identity

**Signature**: `static identity(): Matrix4`

##### translation

**Signature**: `static translation(x: number, y: number, z: number): Matrix4`

##### rotation

**Signature**: `static rotation(angleX: number, angleY: number, angleZ: number): Matrix4`

##### scale

**Signature**: `static scale(x: number, y: number, z: number): Matrix4`

##### perspective

**Signature**: `static perspective(fov: number, aspect: number, near: number, far: number): Matrix4`

##### multiply

**Signature**: `multiply(other: Matrix4): Matrix4`

##### transformPoint

**Signature**: `transformPoint(point: Vector3): Vector3`

#### ChartRenderer

**Methods**:

##### drawLineChart

**Signature**: `drawLineChart(data: ChartData, rect: Rect): void`

##### drawBarChart

**Signature**: `drawBarChart(data: ChartData, rect: Rect): void`

##### drawPieChart

**Signature**: `drawPieChart(data: ChartData, rect: Rect): void`

##### drawTriangle

**Signature**: `private drawTriangle(points: Point2D[], color: Color): void`

##### addEdgeIntersection

**Signature**: `private addEdgeIntersection(p1: Point2D, p2: Point2D, y: number, intersections: number[]): void`

##### generateColor

**Signature**: `private generateColor(index: number): Color`

#### Graphics

**Properties**:

- `Colors: any` - 

**Methods**:

##### createCanvas2D

**Signature**: `static createCanvas2D(width: number, height: number): Canvas2D`

##### createSoftwareRenderer

**Signature**: `static createSoftwareRenderer(width: number, height: number): SoftwareRenderer`

##### createChartRenderer

**Signature**: `static createChartRenderer(context: GraphicsContext): ChartRenderer`

##### rgb

**Signature**: `static rgb(r: number, g: number, b: number): Color`

##### rgba

**Signature**: `static rgba(r: number, g: number, b: number, a: number): Color`

##### hsl

**Signature**: `static hsl(h: number, s: number, l: number): Color`

##### hexToColor

**Signature**: `static hexToColor(hex: string): Color`

##### colorToHex

**Signature**: `static colorToHex(color: Color): string`

### Interfaces

#### Point2D

**Properties**:

- `x: number` - 
- `y: number` - 

#### Point3D

**Properties**:

- `x: number` - 
- `y: number` - 
- `z: number` - 

#### Vector2D

**Extends**: `Point2D`

#### Vector3D

**Extends**: `Point3D`

#### Color

**Properties**:

- `r: number` - 
- `g: number` - 
- `b: number` - 
- `a: number` - 

#### Rect

**Properties**:

- `x: number` - 
- `y: number` - 
- `width: number` - 
- `height: number` - 

#### Circle

**Properties**:

- `center: Point2D` - 
- `radius: number` - 

#### Line

**Properties**:

- `start: Point2D` - 
- `end: Point2D` - 

#### Transform2D

**Properties**:

- `translate: Vector2D` - 
- `scale: Vector2D` - 
- `rotation: number` - 

#### Transform3D

**Properties**:

- `translate: Vector3D` - 
- `scale: Vector3D` - 
- `rotation: Vector3D` - 

#### GraphicsContext

**Properties**:

- `width: number` - 
- `height: number` - 

**Methods**:

##### clear

**Signature**: `clear(color?: Color): void;`

##### drawPixel

**Signature**: `drawPixel(x: number, y: number, color: Color): void;`

##### drawLine

**Signature**: `drawLine(start: Point2D, end: Point2D, color: Color, thickness?: number): void;`

##### drawRect

**Signature**: `drawRect(rect: Rect, color: Color, filled?: boolean): void;`

##### drawCircle

**Signature**: `drawCircle(circle: Circle, color: Color, filled?: boolean): void;`

##### drawText

**Signature**: `drawText(text: string, position: Point2D, color: Color, font?: string): void;`

##### drawImage

**Signature**: `drawImage(imageData: ImageData, position: Point2D, size?: { width: number; height: number }): void;`

#### ChartData

**Properties**:

- `labels: string[]` - 
- `datasets: {
    label: string;
    data: number[];
    color: Color;
    fillColor?: Color;
  }[]` - 


## io

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/io.ts`

### Classes

#### File

**Methods**:

##### read

**Signature**: `static async read(path: string): Promise<string>`

##### write

**Signature**: `static async write(path: string, content: string): Promise<void>`


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


## threading

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/threading.ts`

### Classes

#### WorkerThread

**Properties**:

- `worker: globalThis.Worker | null` - 
- `currentTask: Task | null` - 
- `isIdle: boolean` - 
- `lastUsed: number` - 
- `metrics: WorkerMetrics` - 

**Methods**:

##### initialize

**Signature**: `private initialize(): void`

##### execute

**Signature**: `async execute<T, R>(task: Task<T, R>): Promise<R>`

##### simulateTaskExecution

**Signature**: `private simulateTaskExecution(data: any): any`

##### handleMessage

**Signature**: `private handleMessage(event: MessageEvent): void`

##### handleError

**Signature**: `private handleError(error: ErrorEvent): void`

##### isAvailable

**Signature**: `isAvailable(): boolean`

##### getIdleTime

**Signature**: `getIdleTime(): number`

##### terminate

**Signature**: `terminate(): void`

#### ThreadPool

**Properties**:

- `workers: WorkerThread[]` - 
- `taskQueue: Task[]` - 
- `options: Required<ThreadPoolOptions>` - 
- `isRunning: boolean` - 

**Methods**:

##### initializeWorkers

**Signature**: `private initializeWorkers(): void`

##### submit

**Signature**: `async submit<T, R>(data: T): Promise<R>`

##### parallel

**Signature**: `async parallel<T, R>(items: T[], operation: (item: T) => R | Promise<R>): Promise<R[]>`

##### map

**Signature**: `async map<T, R>(items: T[], mapper: (item: T, index: number) => R | Promise<R>): Promise<R[]>`

##### reduce

**Signature**: `async reduce<T, R>(items: T[], reducer: (acc: R, item: T, index: number) => R, initialValue: R): Promise<R>`

##### chunkArray

**Signature**: `private chunkArray<T>(array: T[], chunkCount: number): T[][]`

##### getAvailableWorker

**Signature**: `private getAvailableWorker(): WorkerThread | null`

##### generateTaskId

**Signature**: `private generateTaskId(): string`

##### startMaintenanceLoop

**Signature**: `private startMaintenanceLoop(): void`

##### getStats

**Signature**: `getStats()`

##### shutdown

**Signature**: `async shutdown(): Promise<void>`

#### Worker

**Properties**:

- `worker: globalThis.Worker` - 

**Methods**:

##### postMessage

**Signature**: `postMessage(data: any): void`

##### onMessage

**Signature**: `onMessage(callback: (data: any) => void): void`

##### terminate

**Signature**: `terminate(): void`

### Interfaces

#### ThreadPoolOptions

**Properties**:

- `minThreads: number` - 
- `maxThreads: number` - 
- `idleTimeout: number` - 
- `taskTimeout: number` - 
- `enableLoadBalancing: boolean` - 
- `priority: 'low' | 'normal' | 'high'` - 
- `retryAttempts: number` - 
- `enableMetrics: boolean` - 

#### Task

**Properties**:

- `id: string` - 
- `data: T` - 
- `resolve: (value: R) => void` - 
- `reject: (error: Error) => void` - 
- `createdAt: number` - 
- `priority: number` - 
- `retryCount: number` - 
- `maxRetries: number` - 
- `dependencies: string[]` - 

#### WorkerMetrics

**Properties**:

- `tasksCompleted: number` - 
- `tasksInProgress: number` - 
- `averageExecutionTime: number` - 
- `errorCount: number` - 
- `cpuUsage: number` - 
- `memoryUsage: number` - 

#### ThreadPoolMetrics

**Properties**:

- `activeThreads: number` - 
- `idleThreads: number` - 
- `totalTasks: number` - 
- `completedTasks: number` - 
- `failedTasks: number` - 
- `queueLength: number` - 
- `averageWaitTime: number` - 
- `throughput: number` - 

### Functions

#### parallel

**Signature**: `export async function parallel<T, R>(items: T[], operation: (item: T) => R | Promise<R>): Promise<R[]>`

#### parallelMap

**Signature**: `export async function parallelMap<T, R>(items: T[], mapper: (item: T, index: number) => R | Promise<R>): Promise<R[]>`

#### parallelReduce

**Signature**: `export async function parallelReduce<T, R>(items: T[], reducer: (acc: R, item: T, index: number) => R, initialValue: R): Promise<R>`


## client

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/http/client.ts`

### Classes

#### HTTPClient

**Properties**:

- `baseUrl: string` - 
- `headers: Record<string, string>` - 

**Methods**:

##### get

**Signature**: `async get<T>(path: string): Promise<T>`

##### post

**Signature**: `async post<T>(path: string, body: any): Promise<T>`


## server

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/http/server.ts`

### Classes

#### HTTPServer

**Properties**:

- `routes: Route[]` - 
- `middlewares: Middleware[]` - 
- `server: ReturnType<typeof createServer>` - 

**Methods**:

##### use

**Signature**: `use(middleware: Middleware): void`

##### get

**Signature**: `get(path: string, handler: RouteHandler): void`

##### post

**Signature**: `post(path: string, handler: RouteHandler): void`

##### put

**Signature**: `put(path: string, handler: RouteHandler): void`

##### delete

**Signature**: `delete(path: string, handler: RouteHandler): void`

##### patch

**Signature**: `patch(path: string, handler: RouteHandler): void`

##### addRoute

**Signature**: `private addRoute(method: string, path: string, handler: RouteHandler): void`

##### pathToRegex

**Signature**: `private pathToRegex(path: string):`

##### parseBody

**Signature**: `private async parseBody(req: IncomingMessage): Promise<any>`

##### parseQuery

**Signature**: `private parseQuery(url: string): Record<string, string>`

##### enhanceResponse

**Signature**: `private enhanceResponse(res: ServerResponse): Response`

##### runMiddlewares

**Signature**: `private async runMiddlewares(req: Request, res: Response): Promise<boolean>`

##### matchRoute

**Signature**: `private matchRoute(method: string, pathname: string):`

##### listen

**Signature**: `listen(port: number, hostname?: string, callback?: () => void): void`

##### close

**Signature**: `close(): Promise<void>`

#### Server

**Extends**: `HTTPServer`

### Interfaces

#### Request

**Extends**: `IncomingMessage`

**Properties**:

- `body: any` - 
- `params: Record<string, string>` - 
- `query: Record<string, string>` - 

#### Response

**Extends**: `ServerResponse`

**Methods**:

##### send

**Signature**: `send(data: any): void;`

##### json

**Signature**: `json(data: any): void;`

##### status

**Signature**: `status(code: number): Response;`

#### Route

**Properties**:

- `method: string` - 
- `path: string` - 
- `handler: RouteHandler` - 
- `pathRegex: RegExp` - 
- `paramNames: string[]` - 

### Functions

#### createHTTPServer

**Signature**: `export function createHTTPServer(): HTTPServer`


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


## decorators

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/database/decorators.ts`

### Functions

#### getMetadata

**Signature**: `export function getMetadata(target: any, key?: string): any`

#### setMetadata

**Signature**: `export function setMetadata(target: any, key: string, value: any): void`

#### id

**Signature**: `export function id(target: any, propertyKey: string): void`

#### field

**Signature**: `export function field(options:`

#### relation

**Signature**: `export function relation(options:`

#### timestamp

**Signature**: `export function timestamp(options:`

#### component

**Signature**: `export function component(target: any): any`

#### state

**Signature**: `export function state(target: any, propertyKey: string): void`

#### effect

**Signature**: `export function effect(target: any, propertyKey: string, descriptor: PropertyDescriptor): void`

#### computed

**Signature**: `export function computed(target: any, propertyKey: string, descriptor: PropertyDescriptor): void`


## query-builder

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/database/query-builder.ts`

### Classes

#### QueryBuilder

**Properties**:

- `entityClass: new () => T` - 
- `whereConditions: WhereCondition<T>[]` - 
- `orderByFields: Array<{ field: OrderByField<T>; direction: OrderDirection }>` - 
- `limitCount: number` - 
- `skipCount: number` - 
- `database: Database` - 

**Methods**:

##### where

**Signature**: `where(condition: WhereCondition<T>): QueryBuilder<T>`

##### orderBy

**Signature**: `orderBy(field: OrderByField<T>, direction: OrderDirection = 'asc'): QueryBuilder<T>`

##### take

**Signature**: `take(count: number): QueryBuilder<T>`

##### skip

**Signature**: `skip(count: number): QueryBuilder<T>`

##### toSQL

**Signature**: `toSQL():`

##### execute

**Signature**: `async execute(): Promise<T[]>`

##### first

**Signature**: `async first(): Promise<T | null>`

##### count

**Signature**: `async count(): Promise<number>`

##### exists

**Signature**: `async exists(): Promise<boolean>`

##### findAll

**Signature**: `async findAll(): Promise<T[]>`

##### findById

**Signature**: `async findById(id: any): Promise<T | null>`

##### sum

**Signature**: `async sum(field: keyof T): Promise<number>`

##### avg

**Signature**: `async avg(field: keyof T): Promise<number>`

##### max

**Signature**: `async max(field: keyof T): Promise<any>`

##### min

**Signature**: `async min(field: keyof T): Promise<any>`

#### Database

**Properties**:

- `_instance: Database` - 
- `mockData: Map<string, any[]>` - 

**Methods**:

##### getInstance

**Signature**: `static getInstance(): Database`

##### initializeMockData

**Signature**: `private initializeMockData(): void`

##### query

**Signature**: `static query<T>(entityClass: new () => T): QueryBuilder<T>`

##### save

**Signature**: `static async save<T>(entity: T): Promise<T>`

##### delete

**Signature**: `static async delete<T>(entity: T): Promise<void>`

##### find

**Signature**: `static async find<T>(entityClass: new () => T, id: any): Promise<T | null>`

##### findAll

**Signature**: `static async findAll<T>(entityClass: new () => T): Promise<T[]>`

##### getMockData

**Signature**: `getMockData(tableName: string): any[]`

##### setMockData

**Signature**: `setMockData(tableName: string, data: any[]): void`

##### clear

**Signature**: `static clear(): void`

### Functions

#### createQuery

**Signature**: `export function createQuery<T>(entityClass: new () => T): QueryBuilder<T>`


## media-errors

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/media-errors.ts`

### Classes

#### OmniCodecError

**Extends**: `Error`

**Properties**:

- `code: OmniCodecErrorCode` - 
- `details: any` - 

#### ValidationError

**Extends**: `OmniCodecError`

#### EncodingError

**Extends**: `OmniCodecError`

#### DecodingError

**Extends**: `OmniCodecError`

#### EncryptionError

**Extends**: `OmniCodecError`

#### ChecksumError

**Extends**: `OmniCodecError`


## media-validator

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/media-validator.ts`

### Classes

#### MediaValidator

**Properties**:

- `MAX_FILE_SIZE: any` - 
- `MAX_DIMENSIONS: any` - 
- `MAX_SAMPLE_RATE: any` - 
- `MAX_CHANNELS: any` - 
- `SUPPORTED_VERSIONS: any` - 

**Methods**:

##### validateEncodeInput

Validate input data for encoding

**Signature**: `static validateEncodeInput(
    data: ArrayBuffer,
    type: 'audio' | 'video',
    metadata: Partial<MediaHeader>,
    options: Partial<OmniCodecOptions> =`

##### validateDecodeInput

Validate input data for decoding

**Signature**: `static validateDecodeInput(encodedData: Uint8Array): void`

##### validateMetadata

Validate metadata based on media type

**Signature**: `private static validateMetadata(metadata: Partial<MediaHeader>, type: 'audio' | 'video'): void`

##### validateAudioMetadata

Validate audio-specific metadata

**Signature**: `private static validateAudioMetadata(metadata: Partial<MediaHeader>): void`

##### validateVideoMetadata

Validate video-specific metadata

**Signature**: `private static validateVideoMetadata(metadata: Partial<MediaHeader>): void`

##### validateOptions

Validate encoding options

**Signature**: `private static validateOptions(options: Partial<OmniCodecOptions>): void`

##### sanitizeMetadata

Sanitize input metadata to prevent injection attacks

**Signature**: `static sanitizeMetadata(metadata: Partial<MediaHeader>): Partial<MediaHeader>`

##### validateHeader

Validate header from decoded data

**Signature**: `static validateHeader(header: MediaHeader): void`


## key-manager

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/key-manager.ts`

### Classes

#### KeyManager

Secure key management for OmniCodec encryption
In production, this would integrate with external key management services

**Properties**:

- `keys: Map<string, EncryptionKeyData>` - 
- `options: Required<KeyManagerOptions>` - 

**Methods**:

##### generateKey

Generate a new encryption key

**Signature**: `async generateKey(algorithm?: 'AES-GCM' | 'AES-CBC'): Promise<EncryptionKeyData>`

##### getKey

Retrieve a key by ID

**Signature**: `getKey(keyId: string): EncryptionKeyData | null`

##### storeKey

Store a key securely (in production, this would use external key storage)

**Signature**: `private storeKey(keyData: EncryptionKeyData): void`

##### generateIV

Generate appropriate IV for the algorithm

**Signature**: `private generateIV(algorithm: 'AES-GCM' | 'AES-CBC'): string`

##### cleanupOldKeys

Clean up old keys to prevent memory leaks

**Signature**: `private cleanupOldKeys(): void`

##### shouldRotateKey

Check if a key needs rotation

**Signature**: `shouldRotateKey(keyData: EncryptionKeyData): boolean`

##### getEncryptionInfo

Get encryption info that can be safely stored in the header

**Signature**: `getEncryptionInfo(keyData: EncryptionKeyData):`

##### deriveKeyFromPassword

Derive a key from a password (for password-based encryption)

**Signature**: `async deriveKeyFromPassword(password: string, salt?: string): Promise<EncryptionKeyData>`

##### clearAllKeys

Clear all stored keys (for security)

**Signature**: `clearAllKeys(): void`

##### getKeyStats

Get statistics about stored keys

**Signature**: `getKeyStats():`

### Interfaces

#### EncryptionKeyData

**Properties**:

- `key: string` - 
- `iv: string` - 
- `algorithm: string` - 
- `keyId: string` - 
- `created: number` - 

#### KeyManagerOptions

**Properties**:

- `defaultAlgorithm: 'AES-GCM' | 'AES-CBC'` - 
- `keyRotationInterval: number` - 
- `maxStoredKeys: number` - 


## performance-monitor

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/performance-monitor.ts`

### Classes

#### PerformanceMonitor

Performance monitoring and metrics collection for production environments

**Properties**:

- `metrics: PerformanceMetrics[]` - 
- `errors: number` - 
- `maxMetrics: number` - 
- `monitoringEnabled: boolean` - 

**Methods**:

##### startMeasurement

Start measuring a performance operation

**Signature**: `startMeasurement(): PerformanceMeasurement`

##### recordMetrics

Record a completed operation

**Signature**: `recordMetrics(metrics: PerformanceMetrics): void`

##### recordError

Record an error

**Signature**: `recordError(): void`

##### getStats

Get comprehensive performance statistics

**Signature**: `getStats(): PerformanceStats`

##### getStatsByOperation

Get stats filtered by operation type

**Signature**: `getStatsByOperation(operationType: 'encode' | 'decode'): PerformanceStats`

##### getStatsByMediaType

Get stats filtered by media type

**Signature**: `getStatsByMediaType(mediaType: 'audio' | 'video'): PerformanceStats`

##### getRecentMetrics

Get recent metrics (last N operations)

**Signature**: `getRecentMetrics(count: number = 10): PerformanceMetrics[]`

##### getPerformanceTrends

Get performance trends over time

**Signature**: `getPerformanceTrends(windowSize: number = 100):`

##### getSystemMetrics

Get system metrics

**Signature**: `getSystemMetrics(): SystemMetrics`

##### exportMetrics

Export metrics for external monitoring systems

**Signature**: `exportMetrics():`

##### clearMetrics

Clear all collected metrics

**Signature**: `clearMetrics(): void`

##### setEnabled

Enable or disable monitoring

**Signature**: `setEnabled(enabled: boolean): void`

##### getMemoryUsage

Get current memory usage (rough estimate)

**Signature**: `private getMemoryUsage(): number`

##### getAvailableMemory

Get available memory (rough estimate)

**Signature**: `private getAvailableMemory(): number`

#### PerformanceMeasurement

Helper class for measuring individual operations

**Properties**:

- `startTime: number` - 
- `monitor: PerformanceMonitor` - 

**Methods**:

##### complete

Complete the measurement and record metrics

**Signature**: `complete(
    operationType: 'encode' | 'decode',
    mediaType: 'audio' | 'video',
    inputSize: number,
    outputSize: number,
    simdEnabled: boolean = false,
    quality: number = 85
  ): void`

##### error

Record an error and abort the measurement

**Signature**: `error(): void`

### Interfaces

#### PerformanceMetrics

**Properties**:

- `operationType: 'encode' | 'decode'` - 
- `mediaType: 'audio' | 'video'` - 
- `inputSize: number` - 
- `outputSize: number` - 
- `compressionRatio: number` - 
- `duration: number` - 
- `simdEnabled: boolean` - 
- `quality: number` - 
- `timestamp: number` - 

#### PerformanceStats

**Properties**:

- `totalOperations: number` - 
- `averageDuration: number` - 
- `averageCompressionRatio: number` - 
- `simdPerformanceGain: number` - 
- `memoryUsage: number` - 
- `errors: number` - 

#### SystemMetrics

**Properties**:

- `cpuUsage: number` - 
- `memoryUsage: number` - 
- `availableMemory: number` - 
- `timestamp: number` - 


## media

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/media.ts`

### Classes

#### OmniCodec

**Properties**:

- `simd: SIMDProcessor` - 
- `keyManager: KeyManager` - 
- `MAGIC_BYTES: any` - 
- `VERSION: any` - 
- `MAX_CHUNK_SIZE: any` - 
- `referenceFrames: ReferenceFrame[]` - 
- `frameCount: any` - 
- `rateControlData: any` - 

**Methods**:

##### encode

Encode audio/video data using the OmniCodec format

**Signature**: `async encode(
    data: ArrayBuffer,
    type: 'audio' | 'video',
    metadata: Partial<MediaHeader>,
    options: Partial<OmniCodecOptions> =`

##### decode

Decode OmniCodec formatted data

**Signature**: `async decode(encodedData: Uint8Array): Promise<`

##### applyDCT

Apply Discrete Cosine Transform for frequency domain compression

**Signature**: `private applyDCT(data: number[]): number[]`

##### applySIMDDCT

SIMD-accelerated DCT transformation

**Signature**: `private applySIMDDCT(data: number[]): number[]`

##### dctBlock

Fast DCT transformation for a single block (optimized)

**Signature**: `private dctBlock(block: number[]): number[]`

##### fastDCT8

Fast 8-point DCT implementation

**Signature**: `private fastDCT8(x: number[]): number[]`

##### fastDCT16

Fast 16-point DCT implementation

**Signature**: `private fastDCT16(x: number[]): number[]`

##### fastDCT2D8x8

Fast 2D 8x8 DCT implementation

**Signature**: `private fastDCT2D8x8(block: number[]): number[]`

##### applyInverseDCT

Apply inverse DCT

**Signature**: `private applyInverseDCT(data: number[]): number[]`

##### idctBlock

Inverse DCT for a single block

**Signature**: `private idctBlock(block: number[]): number[]`

##### quantize

Quantize DCT coefficients based on quality

**Signature**: `private quantize(data: number[], quality: number): number[]`

##### dequantize

Dequantize coefficients

**Signature**: `private dequantize(data: number[], quality: number): number[]`

##### entropyEncode

Simple entropy encoding using run-length encoding

**Signature**: `private entropyEncode(data: number[]): Uint8Array`

##### entropyDecode

Decode entropy-encoded data

**Signature**: `private entropyDecode(data: Uint8Array): number[]`

##### bufferToFloatArray

Convert ArrayBuffer to float array for processing

**Signature**: `private bufferToFloatArray(buffer: ArrayBuffer): number[]`

##### floatArrayToBuffer

Convert float array back to ArrayBuffer

**Signature**: `private floatArrayToBuffer(data: number[]): ArrayBuffer`

##### packageData

Package data with header

**Signature**: `private packageData(header: MediaHeader, data: Uint8Array): Uint8Array`

##### unpackageData

Unpackage data and extract header

**Signature**: `private unpackageData(data: Uint8Array):`

##### arrayEquals

Compare two Uint8Arrays for equality

**Signature**: `private arrayEquals(a: Uint8Array, b: Uint8Array): boolean`

##### encryptData

Encrypt data using secure key management

**Signature**: `private async encryptData(data: Uint8Array, password?: string): Promise<`

##### decryptData

Decrypt data using stored key information

**Signature**: `private async decryptData(encryptedData: Uint8Array, encryptionInfo:`

##### encodeStreaming

Encode large files using streaming approach

**Signature**: `private async encodeStreaming(
    data: ArrayBuffer,
    type: 'audio' | 'video',
    metadata: Partial<MediaHeader>,
    options: OmniCodecOptions,
    measurement: PerformanceMeasurement
  ): Promise<Uint8Array>`

##### getPerformanceStats

Get performance statistics

**Signature**: `getPerformanceStats()`

##### getKeyStats

Get key manager statistics

**Signature**: `getKeyStats()`

##### clearPerformanceMetrics

Clear performance metrics

**Signature**: `clearPerformanceMetrics(): void`

##### clearEncryptionKeys

Clear all encryption keys (for security)

**Signature**: `clearEncryptionKeys(): void`

##### hexToBytes

Helper method to convert hex string to bytes

**Signature**: `private hexToBytes(hex: string): Uint8Array`

##### base64ToBytes

Helper method to convert base64 to bytes

**Signature**: `private base64ToBytes(base64: string): Uint8Array`

##### bytesToBase64

Helper method to convert bytes to base64

**Signature**: `private bytesToBase64(bytes: Uint8Array): string`

##### bufferToVideoFrame

Convert buffer to video frame representation

**Signature**: `private bufferToVideoFrame(buffer: ArrayBuffer, width: number, height: number): VideoFrame`

##### encodeVideoFrame

Main video frame encoding with H.264-level features (optimized)

**Signature**: `private async encodeVideoFrame(frame: VideoFrame, opts: OmniCodecOptions): Promise<`

##### splitIntoBlocks

Split frame into blocks of specified size

**Signature**: `private splitIntoBlocks(frame: VideoFrame, blockSize: number): Block[]`

##### motionEstimation

Fast motion estimation using diamond search pattern (optimized for performance)

**Signature**: `private motionEstimation(currentBlock: Block, refFrame: ReferenceFrame, searchRange: number): MotionVector | null`

##### calculateSAD

Calculate Sum of Absolute Differences (SAD)

**Signature**: `private calculateSAD(block: Block, refData: number[][], refX: number, refY: number): number`

##### fastIntraPredictionMode

Fast intra prediction mode selection (optimized)

**Signature**: `private fastIntraPredictionMode(block: Block, frameData: number[][]): number`

##### fastPredictionCost

Fast prediction cost calculation (optimized)

**Signature**: `private fastPredictionCost(original: number[][], predicted: number[][]): number`

##### calculateIntraCost

Calculate intra prediction cost

**Signature**: `private calculateIntraCost(block: Block, frameData: number[][]): number`

##### calculateMotionCost

Calculate motion compensation cost

**Signature**: `private calculateMotionCost(block: Block, refFrame: ReferenceFrame, mv: MotionVector): number`

##### encodeBlockOptimized

Optimized block encoding

**Signature**: `private encodeBlockOptimized(block: Block, opts: OmniCodecOptions): number[]`

##### applyFastDeblockingFilter

Fast deblocking filter (simplified for performance)

**Signature**: `private applyFastDeblockingFilter(blocks: number[][]): void`

##### predictIntraBlock

Predict intra block based on mode

**Signature**: `private predictIntraBlock(block: Block, frameData: number[][], mode: number): number[][]`

##### getNeighboringPixels

Get neighboring pixels for intra prediction

**Signature**: `private getNeighboringPixels(block: Block, frameData: number[][])`

##### calculateDirectionalPrediction

Calculate directional prediction for complex modes

**Signature**: `private calculateDirectionalPrediction(x: number, y: number, mode: number, neighbors: any): number`

##### calculatePredictionCost

Calculate prediction cost (used for rate-distortion optimization)

**Signature**: `private calculatePredictionCost(original: number[][], predicted: number[][]): number`

##### applyIntraPrediction

Apply intra prediction to block

**Signature**: `private applyIntraPrediction(block: Block, frameData: number[][], mode: number): void`

##### encodeBlock

Encode individual block with DCT and quantization

**Signature**: `private encodeBlock(block: Block, opts: OmniCodecOptions): number[]`

##### applyBlockDCT

Apply DCT to a specific block size

**Signature**: `private applyBlockDCT(data: number[], blockSize: number): number[]`

##### apply4x4DCT

4x4 DCT (simplified)

**Signature**: `private apply4x4DCT(data: number[]): number[]`

##### apply16x16DCT

16x16 DCT (simplified)

**Signature**: `private apply16x16DCT(data: number[]): number[]`

##### perceptualQuantize

Perceptual quantization using quantization matrices

**Signature**: `private perceptualQuantize(data: number[], quality: number, type: 'audio' | 'video', blockSize: number = 8): number[]`

##### scaleQuantMatrix

Scale quantization matrix for different block sizes

**Signature**: `private scaleQuantMatrix(matrix: number[][], targetSize: number): number[][]`

##### qualityToQP

Convert quality (1-100) to quantization parameter (0-51)

**Signature**: `private qualityToQP(quality: number): number`

##### improvedEntropyEncode

Improved entropy encoding (more efficient than CABAC for this use case)

**Signature**: `private improvedEntropyEncode(data: number[]): Uint8Array`

##### zeroRunEncode

Zero-run encoding for quantized DCT coefficients

**Signature**: `private zeroRunEncode(data: number[]): number[]`

##### encodeVariableInt

Variable length integer encoding

**Signature**: `private encodeVariableInt(output: number[], value: number): void`

##### cabacEncode

Context-Adaptive Binary Arithmetic Coding (simplified implementation)

**Signature**: `private cabacEncode(data: number[]): Uint8Array`

##### getCabacContext

Get CABAC context for adaptive encoding

**Signature**: `private getCabacContext(data: number[], index: number): string`

##### valueToBinary

Convert value to binary representation

**Signature**: `private valueToBinary(value: number): number[]`

##### updateProbability

Update probability for adaptive arithmetic coding

**Signature**: `private updateProbability(oldProb: number, outcome: boolean): number`

##### improvedEntropyDecode

Decode data using improved entropy decoding

**Signature**: `private improvedEntropyDecode(data: Uint8Array): number[]`

##### decodeVariableInt

Decode variable length integer

**Signature**: `private decodeVariableInt(data: Uint8Array, offset: number):`

##### zeroRunDecode

Zero-run decoding

**Signature**: `private zeroRunDecode(data: number[]): number[]`

##### decodeAdvanced

Advanced decoding for version 2.0 with H.264-level features

**Signature**: `private decodeAdvanced(quantizedData: number[], header: MediaHeader): number[]`

##### qpToQuality

Convert QP back to quality

**Signature**: `private qpToQuality(qp: number): number`

##### perceptualDequantize

Perceptual dequantization (reverse of perceptual quantization)

**Signature**: `private perceptualDequantize(data: number[], quality: number, type: 'audio' | 'video', blockSize: number = 8): number[]`

##### applyDeblockingFilter

Apply deblocking filter to reduce blocking artifacts

**Signature**: `private applyDeblockingFilter(blocks: number[][], frameWidth: number, frameHeight: number): void`

##### applyHorizontalDeblocking

Apply horizontal deblocking between two adjacent blocks

**Signature**: `private applyHorizontalDeblocking(blocks: number[][], leftBlockIndex: number, rightBlockIndex: number): void`

##### applyVerticalDeblocking

Apply vertical deblocking between two vertically adjacent blocks

**Signature**: `private applyVerticalDeblocking(blocks: number[][], topBlockIndex: number, bottomBlockIndex: number): void`

##### flattenBlocks

Flatten encoded blocks back to 1D array

**Signature**: `private flattenBlocks(blocks: number[][]): number[]`

##### updateReferenceFrames

Update reference frames for inter prediction

**Signature**: `private updateReferenceFrames(currentFrame: VideoFrame, maxRefFrames: number): void`

##### frameToBlocks

Convert frame to blocks for processing

**Signature**: `private frameToBlocks(frame: VideoFrame, options: OmniCodecOptions): Block[]`

##### diamondSearch

Diamond search algorithm for motion estimation

**Signature**: `private diamondSearch(block: Block, refFrame: ReferenceFrame, searchRange: number): MotionVector`

##### calculateSADForBlock

Calculate SAD (Sum of Absolute Differences) for a block

**Signature**: `private calculateSADForBlock(block: Block, refFrame: ReferenceFrame, dx: number, dy: number): number`

##### encodeVideoAdvanced

Enhanced video encoding with B-frame support and sub-pixel motion estimation

**Signature**: `private async encodeVideoAdvanced(
    data: ArrayBuffer, 
    metadata: any, 
    options: OmniCodecOptions
  ): Promise<`

##### determineFrameType

Determine frame type based on GOP pattern

**Signature**: `private determineFrameType(options: OmniCodecOptions): 'I' | 'P' | 'B'`

##### getCurrentGOPPattern

Get current GOP pattern string for debugging/metadata

**Signature**: `private getCurrentGOPPattern(): string`

##### encodeIFrame

Encode I-frame (intra-only prediction)

**Signature**: `private encodeIFrame(
    frame: VideoFrame, 
    options: OmniCodecOptions,
    blockSizes: number[],
    intraModes: number[],
    qp: number
  ): number[]`

##### encodePFrame

Encode P-frame (forward prediction only)

**Signature**: `private encodePFrame(
    frame: VideoFrame,
    options: OmniCodecOptions,
    motionVectors: MotionVector[],
    blockSizes: number[],
    intraModes: number[],
    qp: number
  ): number[]`

##### encodeBFrame

Encode B-frame (bidirectional prediction)

**Signature**: `private encodeBFrame(
    frame: VideoFrame,
    options: OmniCodecOptions,
    motionVectors: MotionVector[],
    blockSizes: number[],
    intraModes: number[],
    qp: number
  ): number[]`

##### subPixelMotionEstimation

Sub-pixel motion estimation with quarter-pixel accuracy

**Signature**: `private subPixelMotionEstimation(
    block: Block, 
    refFrame: ReferenceFrame, 
    options: OmniCodecOptions
  ): MotionVector`

##### halfPixelRefinement

Half-pixel refinement for motion estimation

**Signature**: `private halfPixelRefinement(block: Block, refFrame: ReferenceFrame, intMV: MotionVector): MotionVector`

##### quarterPixelRefinement

Quarter-pixel refinement for motion estimation

**Signature**: `private quarterPixelRefinement(block: Block, refFrame: ReferenceFrame, halfMV: MotionVector): MotionVector`

##### calculateSubPixelCost

Calculate cost for sub-pixel motion vectors

**Signature**: `private calculateSubPixelCost(
    block: Block, 
    refFrame: ReferenceFrame, 
    mv: MotionVector,
    precision: 'half' | 'quarter'
  ): number`

##### interpolateSubPixel

Interpolate sub-pixel values using bilinear interpolation

**Signature**: `private interpolateSubPixel(
    refFrame: ReferenceFrame, 
    x: number, 
    y: number, 
    blockSize: number,
    precision: 'full' | 'half' | 'quarter'
  ): number[][]`

##### getPixel

Safely get pixel value with bounds checking

**Signature**: `private getPixel(refFrame: ReferenceFrame, x: number, y: number): number`

##### calculateBidirectionalCost

Calculate bidirectional prediction cost

**Signature**: `private calculateBidirectionalCost(
    block: Block,
    pastRef: ReferenceFrame,
    futureRef: ReferenceFrame,
    forwardMV: MotionVector,
    backwardMV: MotionVector
  ): number`

##### applyMotionCompensation

Apply motion compensation for P-frames

**Signature**: `private applyMotionCompensation(block: Block, refFrame: ReferenceFrame): void`

##### applyBidirectionalCompensation

Apply bidirectional motion compensation for B-frames

**Signature**: `private applyBidirectionalCompensation(
    block: Block,
    pastRef: ReferenceFrame,
    futureRef: ReferenceFrame,
    forwardMV: MotionVector,
    backwardMV: MotionVector
  ): void`

##### initializeRateControl

Initialize rate control system

**Signature**: `private initializeRateControl(options: OmniCodecOptions, metadata: any): void`

##### calculateRateControlQP

Calculate optimal QP for rate control

**Signature**: `private calculateRateControlQP(options: OmniCodecOptions, frameType: 'I' | 'P' | 'B', estimatedComplexity: number): number`

##### updateRateControl

Update rate control after encoding a frame

**Signature**: `private updateRateControl(actualBits: number, frameType: 'I' | 'P' | 'B'): void`

##### estimateFrameComplexity

Estimate frame complexity for rate control

**Signature**: `private estimateFrameComplexity(frame: VideoFrame): number`

##### getRateControlStats

Get current rate control statistics

**Signature**: `private getRateControlStats():`

##### applyAdaptiveQuantization

Adaptive quantization - adjust QP per macroblock based on local complexity

**Signature**: `private applyAdaptiveQuantization(blocks: Block[], baseQP: number): void`

##### calculateBlockComplexity

Calculate complexity of a single block

**Signature**: `private calculateBlockComplexity(block: Block): number`

##### getCodecInfo

Get codec information

**Signature**: `static getCodecInfo():`

#### MediaUtils

Media utility functions

**Methods**:

##### analyzeBuffer

Analyze media file properties

**Signature**: `static analyzeBuffer(buffer: ArrayBuffer):`

##### generateTestData

Generate test media data

**Signature**: `static generateTestData(type: 'audio' | 'video', duration: number = 1000): ArrayBuffer`

### Interfaces

#### MediaHeader

OmniCodec - A unique audio/video encoding format for Omniscript
Features:
- DCT-based frequency domain compression
- Custom quantization matrices for quality control
- Adaptive entropy encoding
- Built-in encryption and checksums
- SIMD-accelerated processing
- Support for both audio and video streams

**Properties**:

- `version: string` - 
- `codec: string` - 
- `width: number` - 
- `height: number` - 
- `channels: number` - 
- `sampleRate: number` - 
- `frameRate: number` - 
- `duration: number` - 
- `checksum: string` - 
- `encrypted: boolean` - 
- `encryptionInfo: {
    keyId: string;
    algorithm: string;
  }` - 
- `frameType: 'I' | 'P' | 'B'` - 
- `qp: number` - 
- `blockSizes: number[]` - 
- `intraModes: number[]` - 
- `motionVectors: MotionVector[]` - 
- `poc: number` - 
- `gopStructure: string` - 
- `targetBitrate: number` - 
- `actualBitrate: number` - 

#### MotionVector

**Properties**:

- `x: number` - 
- `y: number` - 
- `refFrame: number` - 
- `blockIndex: number` - 
- `precision: 'full' | 'half' | 'quarter'` - 

#### EncodedFrame

**Properties**:

- `type: 'audio' | 'video'` - 
- `timestamp: number` - 
- `data: Uint8Array` - 
- `size: number` - 

#### VideoFrame

**Properties**:

- `width: number` - 
- `height: number` - 
- `data: number[][]` - 
- `frameType: 'I' | 'P' | 'B'` - 
- `timestamp: number` - 
- `poc: number` - 

#### Block

**Properties**:

- `x: number` - 
- `y: number` - 
- `size: number` - 
- `data: number[][]` - 
- `predictionMode: number` - 
- `motionVector: MotionVector` - 

#### ReferenceFrame

**Properties**:

- `data: number[][]` - 
- `timestamp: number` - 
- `frameIndex: number` - 

#### OmniCodecOptions

**Properties**:

- `quality: number` - 
- `enableEncryption: boolean` - 
- `enableSIMD: boolean` - 
- `compressionLevel: number` - 
- `password: string` - 
- `streamingMode: boolean` - 
- `maxMemoryUsage: number` - 
- `motionEstimation: boolean` - 
- `intraPrediction: boolean` - 
- `variableBlockSize: boolean` - 
- `deblockingFilter: boolean` - 
- `rateDistortionOptimization: boolean` - 
- `maxReferenceFrames: number` - 
- `searchRange: number` - 
- `enableBFrames: boolean` - 
- `subPixelMotionEstimation: boolean` - 
- `gopSize: number` - 
- `adaptiveQuantization: boolean` - 
- `targetBitrate: number` - 
- `maxBitrate: number` - 
- `twoPassEncoding: boolean` - 
- `constantQuality: boolean` - 


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


## regex

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/regex.ts`

### Classes

#### Regex

**Properties**:

- `pattern: RegExp` - 
- `patterns: any` - 

**Methods**:

##### test

Test if pattern matches string

**Signature**: `test(input: string): boolean`

##### match

Find first match in string

**Signature**: `match(input: string): RegexMatch | null`

##### matchAll

Find all matches in string

**Signature**: `matchAll(input: string): RegexMatch[]`

##### replace

Replace matches in string

**Signature**: `replace(input: string, replacement: string | ((match: RegexMatch) => string)): string`

##### split

Split string by regex pattern

**Signature**: `split(input: string, limit?: number): string[]`

##### toString

Get the regex pattern as string

**Signature**: `toString(): string`

##### escape

Escape special regex characters in string

**Signature**: `static escape(input: string): string`

##### create

Create regex from string with flags

**Signature**: `static create(pattern: string, options?: RegexReplaceOptions): Regex`

##### test

Test if string matches pattern

**Signature**: `static test(pattern: string, input: string, flags?: string): boolean`

##### match

Find first match

**Signature**: `static match(pattern: string, input: string, flags?: string): RegexMatch | null`

##### matchAll

Find all matches

**Signature**: `static matchAll(pattern: string, input: string, flags?: string): RegexMatch[]`

##### replace

Replace matches

**Signature**: `static replace(pattern: string, input: string, replacement: string | ((match: RegexMatch) => string), flags?: string): string`

##### split

Split string

**Signature**: `static split(pattern: string, input: string, limit?: number, flags?: string): string[]`

##### isEmail

Validate email format

**Signature**: `static isEmail(input: string): boolean`

##### isUrl

Validate URL format

**Signature**: `static isUrl(input: string): boolean`

##### isPhone

Validate phone number format

**Signature**: `static isPhone(input: string): boolean`

##### isIPv4

Validate IPv4 address format

**Signature**: `static isIPv4(input: string): boolean`

##### isIPv6

Validate IPv6 address format

**Signature**: `static isIPv6(input: string): boolean`

##### isUUID

Validate UUID format

**Signature**: `static isUUID(input: string): boolean`

##### isHexColor

Validate hex color format

**Signature**: `static isHexColor(input: string): boolean`

##### extractEmails

Extract all email addresses from text

**Signature**: `static extractEmails(text: string): string[]`

##### extractUrls

Extract all URLs from text

**Signature**: `static extractUrls(text: string): string[]`

### Interfaces

#### RegexMatch

**Properties**:

- `match: string` - 
- `index: number` - 
- `groups: string[]` - 
- `namedGroups: Record<string, string>` - 

#### RegexReplaceOptions

**Properties**:

- `global: boolean` - 
- `ignoreCase: boolean` - 
- `multiline: boolean` - 
- `dotAll: boolean` - 
- `unicode: boolean` - 
- `sticky: boolean` - 


## path

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/path.ts`

### Classes

#### Path

**Methods**:

##### join

Join path segments into a normalized path

**Signature**: `static join(...paths: string[]): string`

##### resolve

Resolve path segments into an absolute path

**Signature**: `static resolve(...paths: string[]): string`

##### relative

Get relative path from 'from' to 'to'

**Signature**: `static relative(from: string, to: string): string`

##### normalize

Normalize a path, resolving '..' and '.' segments

**Signature**: `static normalize(path: string): string`

##### isAbsolute

Check if path is absolute

**Signature**: `static isAbsolute(path: string): boolean`

##### dirname

Get the directory name of a path

**Signature**: `static dirname(path: string): string`

##### basename

Get the base name of a path

**Signature**: `static basename(path: string, ext?: string): string`

##### extname

Get the extension of a path

**Signature**: `static extname(path: string): string`

##### parse

Parse a path into its components

**Signature**: `static parse(path: string): ParsedPath`

##### format

Format a path object into a path string

**Signature**: `static format(pathObject: Partial<ParsedPath>): string`

##### toPosix

Convert path to use forward slashes (POSIX-style)

**Signature**: `static toPosix(path: string): string`

##### toWindows

Convert path to use backslashes (Windows-style)

**Signature**: `static toWindows(path: string): string`

##### getCurrentDirectory

Get current working directory

**Signature**: `private static getCurrentDirectory(): string`

##### equals

Check if two paths are the same

**Signature**: `static equals(path1: string, path2: string): boolean`

##### commonPrefix

Get the common prefix of multiple paths

**Signature**: `static commonPrefix(...paths: string[]): string`

##### isWithin

Check if a path is within another path

**Signature**: `static isWithin(parent: string, child: string): boolean`

##### stem

Get file name without extension

**Signature**: `static stem(path: string): string`

##### changeExtension

Change file extension

**Signature**: `static changeExtension(path: string, newExt: string): string`

##### addSuffix

Add suffix to file name (before extension)

**Signature**: `static addSuffix(path: string, suffix: string): string`

##### addPrefix

Add prefix to file name

**Signature**: `static addPrefix(path: string, prefix: string): string`

### Interfaces

#### ParsedPath

**Properties**:

- `root: string` - 
- `dir: string` - 
- `base: string` - 
- `ext: string` - 
- `name: string` - 


## string

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/string.ts`

### Classes

#### StringUtils

**Methods**:

##### isEmpty

Check if string is empty or only whitespace

**Signature**: `static isEmpty(str: string): boolean`

##### isNotEmpty

Check if string is not empty

**Signature**: `static isNotEmpty(str: string): boolean`

##### capitalize

Capitalize first letter of string

**Signature**: `static capitalize(str: string, options?: StringCaseOptions): string`

##### camelCase

Convert string to camelCase

**Signature**: `static camelCase(str: string): string`

##### pascalCase

Convert string to PascalCase

**Signature**: `static pascalCase(str: string): string`

##### kebabCase

Convert string to kebab-case

**Signature**: `static kebabCase(str: string): string`

##### snakeCase

Convert string to snake_case

**Signature**: `static snakeCase(str: string): string`

##### pad

Pad string to specified length

**Signature**: `static pad(str: string, length: number, options?: StringPadOptions): string`

##### truncate

Truncate string to max length with optional suffix

**Signature**: `static truncate(str: string, maxLength: number, suffix: string = '...'): string`

##### repeat

Repeat string n times with optional separator

**Signature**: `static repeat(str: string, count: number, separator: string = ''): string`

##### removeWhitespace

Remove all whitespace from string

**Signature**: `static removeWhitespace(str: string): string`

##### normalizeWhitespace

Normalize whitespace (replace multiple spaces with single space)

**Signature**: `static normalizeWhitespace(str: string): string`

##### reverse

Reverse string

**Signature**: `static reverse(str: string): string`

##### count

Count occurrences of substring

**Signature**: `static count(str: string, search: string): number`

##### isNumeric

Check if string contains only digits

**Signature**: `static isNumeric(str: string): boolean`

##### isAlpha

Check if string contains only letters

**Signature**: `static isAlpha(str: string): boolean`

##### isAlphanumeric

Check if string contains only letters and digits

**Signature**: `static isAlphanumeric(str: string): boolean`

##### isEmail

Check if string is a valid email

**Signature**: `static isEmail(str: string): boolean`

##### isUrl

Check if string is a valid URL

**Signature**: `static isUrl(str: string): boolean`

##### extractEmails

Extract all email addresses from string

**Signature**: `static extractEmails(str: string): string[]`

##### extractUrls

Extract all URLs from string

**Signature**: `static extractUrls(str: string): string[]`

##### random

Generate random string of specified length

**Signature**: `static random(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string`

##### randomAlphanumeric

Generate random alphanumeric string

**Signature**: `static randomAlphanumeric(length: number): string`

##### randomAlpha

Generate random alphabetic string

**Signature**: `static randomAlpha(length: number): string`

##### randomNumeric

Generate random numeric string

**Signature**: `static randomNumeric(length: number): string`

##### uuid

Generate UUID v4

**Signature**: `static uuid(): string`

##### levenshteinDistance

Calculate Levenshtein distance between two strings

**Signature**: `static levenshteinDistance(str1: string, str2: string): number`

##### similarity

Calculate string similarity (0-1 based on Levenshtein distance)

**Signature**: `static similarity(str1: string, str2: string): number`

##### splitAndTrim

Split string and trim each part

**Signature**: `static splitAndTrim(str: string, separator: string | RegExp): string[]`

##### joinNatural

Join array with different separators for last item

**Signature**: `static joinNatural(items: string[], separator: string = ', ', lastSeparator: string = ' and '): string`

##### escapeHtml

Escape HTML special characters

**Signature**: `static escapeHtml(str: string): string`

##### unescapeHtml

Unescape HTML entities

**Signature**: `static unescapeHtml(str: string): string`

##### titleCase

Convert string to title case

**Signature**: `static titleCase(str: string): string`

##### words

Extract words from string

**Signature**: `static words(str: string): string[]`

##### wordCount

Count words in string

**Signature**: `static wordCount(str: string): number`

### Interfaces

#### StringPadOptions

**Properties**:

- `character: string` - 
- `side: 'left' | 'right' | 'both'` - 

#### StringCaseOptions

**Properties**:

- `locale: string` - 


## url

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/url.ts`

### Classes

#### UrlUtils

**Methods**:

##### parse

Parse URL string into components

**Signature**: `static parse(url: string): ParsedUrl`

##### build

Build URL from components

**Signature**: `static build(components: Partial<ParsedUrl>, options?: UrlBuilderOptions): string`

##### join

Join URL paths correctly

**Signature**: `static join(...paths: string[]): string`

##### joinPaths

Join just the path components

**Signature**: `private static joinPaths(...paths: string[]): string`

##### addParams

Add or update query parameters

**Signature**: `static addParams(url: string, params: Record<string, string | number | boolean>): string`

##### removeParams

Remove query parameters

**Signature**: `static removeParams(url: string, ...keys: string[]): string`

##### getParam

Get specific query parameter value

**Signature**: `static getParam(url: string, key: string): string | null`

##### getParams

Get all query parameters as object

**Signature**: `static getParams(url: string): Record<string, string>`

##### isAbsolute

Check if URL is absolute

**Signature**: `static isAbsolute(url: string): boolean`

##### isRelative

Check if URL is relative

**Signature**: `static isRelative(url: string): boolean`

##### toAbsolute

Convert relative URL to absolute

**Signature**: `static toAbsolute(relativeUrl: string, baseUrl: string): string`

##### normalize

Normalize URL (remove redundant parts, standardize format)

**Signature**: `static normalize(url: string): string`

##### getDomain

Extract domain from URL

**Signature**: `static getDomain(url: string): string`

##### getSubdomain

Extract subdomain from URL

**Signature**: `static getSubdomain(url: string): string`

##### getRootDomain

Extract root domain (without subdomain)

**Signature**: `static getRootDomain(url: string): string`

##### isSameDomain

Check if two URLs are from the same domain

**Signature**: `static isSameDomain(url1: string, url2: string): boolean`

##### encode

Encode URL component

**Signature**: `static encode(component: string): string`

##### decode

Decode URL component

**Signature**: `static decode(component: string): string`

##### isValid

Validate URL format

**Signature**: `static isValid(url: string): boolean`

##### getExtension

Extract file extension from URL path

**Signature**: `static getExtension(url: string): string`

##### getFilename

Extract filename from URL path

**Signature**: `static getFilename(url: string): string`

##### slug

Create URL-safe slug from string

**Signature**: `static slug(text: string): string`

##### parseQuery

Parse query string into object

**Signature**: `static parseQuery(queryString: string): Record<string, string | string[]>`

##### buildQuery

Build query string from object

**Signature**: `static buildQuery(params: Record<string, any>, options?: UrlBuilderOptions): string`

#### UrlBuilder

**Properties**:

- `components: Partial<ParsedUrl>` - 

**Methods**:

##### protocol

**Signature**: `protocol(protocol: string): this`

##### hostname

**Signature**: `hostname(hostname: string): this`

##### port

**Signature**: `port(port: number | string): this`

##### path

**Signature**: `path(pathname: string): this`

##### param

**Signature**: `param(key: string, value: string | number | boolean): this`

##### params

**Signature**: `params(params: Record<string, string | number | boolean>): this`

##### hash

**Signature**: `hash(hash: string): this`

##### build

**Signature**: `build(): string`

##### toString

**Signature**: `toString(): string`

### Interfaces

#### ParsedUrl

**Properties**:

- `protocol: string` - 
- `hostname: string` - 
- `port: string` - 
- `pathname: string` - 
- `search: string` - 
- `hash: string` - 
- `searchParams: Map<string, string>` - 

#### UrlBuilderOptions

**Properties**:

- `encode: boolean` - 
- `arrayFormat: 'brackets' | 'indices' | 'comma'` - 


## random

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/random.ts`

### Classes

#### RandomUtils

**Properties**:

- `seed: number | null` - 

**Methods**:

##### setSeed

Set seed for reproducible random numbers

**Signature**: `static setSeed(seed: number): void`

##### getRandom

Get seeded random number or use Math.random

**Signature**: `private static getRandom(): number`

##### int

Generate random integer between min and max (inclusive)

**Signature**: `static int(min: number, max: number): number`

##### float

Generate random float between min and max

**Signature**: `static float(min: number = 0, max: number = 1): number`

##### boolean

Generate random boolean

**Signature**: `static boolean(probability: number = 0.5): boolean`

##### choice

Pick random element from array

**Signature**: `static choice<T>(array: T[]): T`

##### choices

Pick multiple random elements from array (with replacement)

**Signature**: `static choices<T>(array: T[], count: number): T[]`

##### sample

Sample random elements from array (without replacement)

**Signature**: `static sample<T>(array: T[], count: number): T[]`

##### weightedChoice

Weighted random selection

**Signature**: `static weightedChoice<T>(items: WeightedItem<T>[]): T`

##### shuffle

Shuffle array using Fisher-Yates algorithm

**Signature**: `static shuffle<T>(array: T[]): T[]`

##### string

Generate random string

**Signature**: `static string(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string`

##### alphanumeric

Generate random alphanumeric string

**Signature**: `static alphanumeric(length: number): string`

##### alpha

Generate random alphabetic string

**Signature**: `static alpha(length: number): string`

##### numeric

Generate random numeric string

**Signature**: `static numeric(length: number): string`

##### hex

Generate random hex string

**Signature**: `static hex(length: number): string`

##### uuid

Generate UUID v4

**Signature**: `static uuid(): string`

##### color

Generate random color in hex format

**Signature**: `static color(): string`

##### rgb

Generate random RGB color

**Signature**: `static rgb():`

##### hsl

Generate random HSL color

**Signature**: `static hsl():`

##### bytes

Generate random bytes

**Signature**: `static bytes(length: number): Uint8Array`

##### normal

Generate random normal distribution (Box-Muller)

**Signature**: `static normal(mean: number = 0, standardDeviation: number = 1): number`

##### exponential

Generate random exponential distribution

**Signature**: `static exponential(lambda: number = 1): number`

##### uniform

Generate random uniform distribution

**Signature**: `static uniform(min: number = 0, max: number = 1): number`

##### poisson

Generate random poisson distribution

**Signature**: `static poisson(lambda: number): number`

##### date

Generate random date between two dates

**Signature**: `static date(start: Date, end: Date): Date`

##### time

Generate random time (hours, minutes, seconds)

**Signature**: `static time():`

##### coordinate

Generate random coordinate within bounds

**Signature**: `static coordinate(bounds:`

##### unitCircle

Generate random point on unit circle

**Signature**: `static unitCircle():`

##### unitSphere

Generate random point in unit sphere

**Signature**: `static unitSphere():`

##### walk

Generate random walk data

**Signature**: `static walk(steps: number, stepSize: number = 1): number[]`

##### matrix

Generate random matrix

**Signature**: `static matrix(rows: number, cols: number, min: number = 0, max: number = 1): number[][]`

##### password

Generate random password

**Signature**: `static password(length: number = 12, options:`

##### firstName

Generate random name (first name)

**Signature**: `static firstName(): string`

##### lastName

Generate random last name

**Signature**: `static lastName(): string`

##### fullName

Generate random full name

**Signature**: `static fullName(): string`

##### email

Generate random email

**Signature**: `static email(): string`

##### phoneNumber

Generate random phone number

**Signature**: `static phoneNumber(format: string = '(###) ###-####'): string`

##### resetSeed

Reset seed (return to Math.random)

**Signature**: `static resetSeed(): void`

### Interfaces

#### RandomOptions

**Properties**:

- `seed: number` - 

#### WeightedItem

**Properties**:

- `item: T` - 
- `weight: number` - 


## tuple

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/tuple.ts`

### Classes

#### OmniTuple

Core Tuple class providing immutable tuple operations

**Properties**:

- `_elements: readonly unknown[]` - 
- `_size: number` - 

**Methods**:

##### get

Get element at index

**Signature**: `get<Index extends number>(index: Index): T[Index]`

##### toArray

Convert to array (creates a copy)

**Signature**: `toArray(): unknown[]`

##### contains

Check if tuple contains a value

**Signature**: `contains(value: unknown): boolean`

##### with

Create new tuple with element replaced at index

**Signature**: `with<Index extends number, U>(index: Index, value: U): OmniTuple<
    T extends readonly [...infer Before, unknown, ...infer After]
      ? Index extends Before['length']
        ? readonly [...Before, U, ...After]
        : T
      : T
  >`

##### append

Append element(s) to create new tuple

**Signature**: `append<U extends readonly unknown[]>(...elements: U): OmniTuple<readonly unknown[]>`

##### prepend

Prepend element(s) to create new tuple

**Signature**: `prepend<U extends readonly unknown[]>(...elements: U): OmniTuple<readonly unknown[]>`

##### take

Take first N elements

**Signature**: `take<N extends number>(n: N): OmniTuple<readonly unknown[]>`

##### drop

Drop first N elements

**Signature**: `drop<N extends number>(n: N): OmniTuple<readonly unknown[]>`

##### reverse

Reverse the tuple

**Signature**: `reverse(): OmniTuple<readonly unknown[]>`

##### map

Map over tuple elements

**Signature**: `map<U>(fn: (value: unknown, index: number) => U): OmniTuple<readonly U[]>`

##### fold

Fold/reduce the tuple

**Signature**: `fold<U>(fn: (acc: U, value: unknown, index: number) => U, initial: U): U`

##### equals

Check tuple equality

**Signature**: `equals(other: OmniTuple<readonly unknown[]>): boolean`

##### deepEquals

Deep equality check

**Signature**: `deepEquals(other: OmniTuple<readonly unknown[]>): boolean`

##### toString

String representation

**Signature**: `toString(): string`

##### toJSON

JSON representation

**Signature**: `toJSON(): readonly unknown[]`

##### match

Pattern matching support

**Signature**: `match<U>(patterns:`

#### TupleUtils

Tuple utility functions

**Methods**:

##### from

Create tuple from array

**Signature**: `static from<T extends readonly unknown[]>(array: T): OmniTuple<T>`

##### empty

Create empty tuple

**Signature**: `static empty(): OmniTuple<readonly []>`

##### single

Create singleton tuple

**Signature**: `static single<T>(value: T): OmniTuple<readonly [T]>`

##### pair

Create pair tuple

**Signature**: `static pair<T, U>(first: T, second: U): OmniTuple<readonly [T, U]>`

##### triple

Create triple tuple

**Signature**: `static triple<T, U, V>(first: T, second: U, third: V): OmniTuple<readonly [T, U, V]>`

##### zip

Zip multiple arrays into tuple of tuples

**Signature**: `static zip<T extends readonly unknown[][]>(...arrays: T): OmniTuple<
    readonly OmniTuple<`

##### unzip

Unzip tuple of tuples into separate arrays

**Signature**: `static unzip<T extends readonly OmniTuple<readonly unknown[]>[]>(
    tuples: OmniTuple<T>
  ): readonly unknown[][]`

##### range

Create range tuple

**Signature**: `static range(start: number, end: number, step: number = 1): OmniTuple<readonly number[]>`

##### repeat

Repeat value N times

**Signature**: `static repeat<T>(value: T, count: number): OmniTuple<readonly T[]>`

##### flatten

Flatten nested tuples

**Signature**: `static flatten<T>(tuple: OmniTuple<readonly (T | OmniTuple<readonly T[]>)[]>): OmniTuple<readonly T[]>`

##### groupBy

Group elements by key function

**Signature**: `static groupBy<T, K>(
    tuple: OmniTuple<readonly T[]>, 
    keyFn: (value: T) => K
  ): Map<K, OmniTuple<readonly T[]>>`

##### sort

Sort tuple elements

**Signature**: `static sort<T>(
    tuple: OmniTuple<readonly T[]>, 
    compareFn?: (a: unknown, b: unknown) => number
  ): OmniTuple<readonly unknown[]>`

##### matches

Check if tuple matches pattern

**Signature**: `static matches<T extends readonly unknown[]>(
    tuple: OmniTuple<T>, 
    pattern: TuplePattern<T>
  ): boolean`

##### cartesianProduct

Cartesian product of tuples

**Signature**: `static cartesianProduct<T extends readonly OmniTuple<readonly unknown[]>[]>(
    ...tuples: T
  ): OmniTuple<readonly OmniTuple<readonly unknown[]>[]>`

### Interfaces

#### TuplePattern

**Properties**:

- `type: 'tuple'` - 
- `elements: readonly unknown[]` - 
- `size: number` - 


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


## reactive

**File**: `src/stdlib/reactive.ts`

### Classes

#### Stream

**Implements**: `Observable`

**Properties**:

- `observers: Observer<T>[]` - 
- `errorHandlers: ErrorHandler[]` - 
- `completeHandlers: CompleteHandler[]` - 
- `isCompleted: boolean` - 
- `hasError: boolean` - 
- `lastError: Error` - 

**Methods**:

##### subscribe

**Signature**: `subscribe(observer: Observer<T>, error?: ErrorHandler, complete?: CompleteHandler): Subscription`

##### next

**Signature**: `next(value: T): void`

##### error

**Signature**: `error(error: Error): void`

##### complete

**Signature**: `complete(): void`

##### cleanup

**Signature**: `private cleanup(): void`

##### map

**Signature**: `map<R>(fn: (value: T) => R): Observable<R>`

##### filter

**Signature**: `filter(fn: (value: T) => boolean): Observable<T>`

##### distinctUntilChanged

**Signature**: `distinctUntilChanged(compareFn: (a: T, b: T) => boolean = (a, b) => a === b): Observable<T>`

##### debounce

**Signature**: `debounce(delay: number): Observable<T>`

##### throttle

**Signature**: `throttle(delay: number): Observable<T>`

##### scan

**Signature**: `scan<R>(fn: (acc: R, value: T) => R, seed: R): Observable<R>`

##### take

**Signature**: `take(count: number): Observable<T>`

##### takeUntil

**Signature**: `takeUntil<U>(notifier: Observable<U>): Observable<T>`

##### combineWith

**Signature**: `combineWith<U, R>(other: Observable<U>, combiner: (a: T, b: U) => R): Observable<R>`

##### merge

**Signature**: `merge(other: Observable<T>): Observable<T>`

##### switchMap

**Signature**: `switchMap<R>(fn: (value: T) => Observable<R>): Observable<R>`

##### share

**Signature**: `share(): Observable<T>`

#### Subject

**Extends**: `Stream`

#### BehaviorSubject

**Extends**: `Subject`

**Properties**:

- `_value: T` - 

**Methods**:

##### next

**Signature**: `next(value: T): void`

##### subscribe

**Signature**: `subscribe(observer: Observer<T>, error?: ErrorHandler, complete?: CompleteHandler): Subscription`

#### Signal

**Properties**:

- `_value: T` - 
- `stream: BehaviorSubject<T>` - 

**Methods**:

##### asObservable

**Signature**: `asObservable(): Observable<T>`

##### subscribe

**Signature**: `subscribe(observer: Observer<T>, error?: ErrorHandler, complete?: CompleteHandler): Subscription`

##### map

**Signature**: `map<R>(fn: (value: T) => R): Signal<R>`

#### ReactiveState

**Properties**:

- `state: Signal<T>` - 
- `computed: Map<string, Signal<any>>` - 
- `effects: Map<string, Subscription>` - 
- `middleware: ((oldState: T, newState: T, action: string) => T)[]` - 

**Methods**:

##### getState

**Signature**: `getState(): T`

##### setState

**Signature**: `setState(newState: Partial<T>, action: string = 'setState'): void`

##### select

**Signature**: `select<R>(selector: (state: T) => R): Observable<R>`

##### addComputed

**Signature**: `addComputed<R>(name: string, fn: (state: T) => R): Signal<R>`

##### addEffect

**Signature**: `addEffect(name: string, fn: (state: T) => void): void`

##### removeEffect

**Signature**: `removeEffect(name: string): void`

##### addMiddleware

**Signature**: `addMiddleware(middleware: (oldState: T, newState: T, action: string) => T): void`

##### dispose

**Signature**: `dispose(): void`

### Interfaces

#### Observable

**Methods**:

##### subscribe

**Signature**: `subscribe(observer: Observer<T>, error?: ErrorHandler, complete?: CompleteHandler): Subscription;`

##### map

**Signature**: `map<R>(fn: (value: T) => R): Observable<R>;`

##### filter

**Signature**: `filter(fn: (value: T) => boolean): Observable<T>;`

##### distinctUntilChanged

**Signature**: `distinctUntilChanged(compareFn?: (a: T, b: T) => boolean): Observable<T>;`

##### debounce

**Signature**: `debounce(delay: number): Observable<T>;`

##### throttle

**Signature**: `throttle(delay: number): Observable<T>;`

##### scan

**Signature**: `scan<R>(fn: (acc: R, value: T) => R, seed: R): Observable<R>;`

##### take

**Signature**: `take(count: number): Observable<T>;`

##### takeUntil

**Signature**: `takeUntil<U>(notifier: Observable<U>): Observable<T>;`

##### combineWith

**Signature**: `combineWith<U, R>(other: Observable<U>, combiner: (a: T, b: U) => R): Observable<R>;`

##### merge

**Signature**: `merge(other: Observable<T>): Observable<T>;`

##### switchMap

**Signature**: `switchMap<R>(fn: (value: T) => Observable<R>): Observable<R>;`

##### share

**Signature**: `share(): Observable<T>;`

### Functions

#### from

**Signature**: `export function from<T>(values: T[]): Observable<T>`

#### interval

**Signature**: `export function interval(delay: number): Observable<number>`

#### timer

**Signature**: `export function timer(delay: number): Observable<number>`

#### merge

**Signature**: `export function merge<T>(...observables: Observable<T>[]): Observable<T>`

#### combineLatest

**Signature**: `export function combineLatest<T, U, R>(
  obsA: Observable<T>,
  obsB: Observable<U>,
  combiner: (a: T, b: U) => R
): Observable<R>`


## type-checker

**File**: `src/type-checker/index.ts`

### Classes

#### TypeInferenceEngine

**Properties**:

- `symbolTable: Map<string, Type>` - 
- `genericConstraints: Map<string, Type[]>` - 

**Methods**:

##### inferType

**Signature**: `inferType(expr: any, context: Map<string, Type> = new Map()): Type`

##### inferLiteralType

**Signature**: `private inferLiteralType(expr: any): Type`

##### inferBinaryType

**Signature**: `private inferBinaryType(expr: any, context: Map<string, Type>): Type`

##### inferCallType

**Signature**: `private inferCallType(expr: any, context: Map<string, Type>): Type`

##### inferObjectType

**Signature**: `private inferObjectType(expr: any, context: Map<string, Type>): Type`

##### inferArrayType

**Signature**: `private inferArrayType(expr: any, context: Map<string, Type>): Type`

##### isNumericType

**Signature**: `private isNumericType(type: Type): boolean`

##### isStringType

**Signature**: `private isStringType(type: Type): boolean`

##### findCommonType

**Signature**: `private findCommonType(types: Type[]): Type`

##### typesEqual

**Signature**: `private typesEqual(type1: Type, type2: Type): boolean`

##### createUnionType

**Signature**: `createUnionType(types: Type[]): Type`

##### createIntersectionType

**Signature**: `createIntersectionType(types: Type[]): Type`

##### createFunctionType

**Signature**: `createFunctionType(parameters: Type[], returnType: Type): Type`

#### TypeChecker

**Properties**:

- `inferenceEngine: any` - 

**Methods**:

##### check

**Signature**: `check(ast: any)`

##### visitNode

**Signature**: `private visitNode(node: any, errors: any[]): void`

##### checkVariableDeclaration

**Signature**: `private checkVariableDeclaration(node: any, errors: any[]): void`

##### checkFunctionDeclaration

**Signature**: `private checkFunctionDeclaration(node: any, errors: any[]): void`

##### checkClassDeclaration

**Signature**: `private checkClassDeclaration(node: any, errors: any[]): void`

##### checkBinaryExpression

**Signature**: `private checkBinaryExpression(node: any, errors: any[]): void`

##### parseTypeString

**Signature**: `private parseTypeString(typeStr: string): Type`

##### isTypeCompatible

**Signature**: `private isTypeCompatible(actual: Type, expected: Type): boolean`

##### isNumericType

**Signature**: `private isNumericType(type: Type): boolean`

##### isStringType

**Signature**: `private isStringType(type: Type): boolean`

##### inferReturnType

**Signature**: `private inferReturnType(body: any[]): Type`

##### typeToString

**Signature**: `private typeToString(type: Type): string`

##### inferType

**Signature**: `private inferType(expr: any): string`

##### validateType

**Signature**: `validateType(expected: string, actual: string, line: number = 0, column: number = 0)`

### Interfaces

#### Type

**Properties**:

- `kind: 'primitive' | 'union' | 'intersection' | 'generic' | 'function' | 'object' | 'array'` - 
- `name: string` - 
- `types: Type[]` - 
- `parameters: Type[]` - 
- `returnType: Type` - 
- `properties: Record<string, Type>` - 
- `elementType: Type` - 
- `constraints: Type[]` - 


