# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [runtime](#runtime)

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


