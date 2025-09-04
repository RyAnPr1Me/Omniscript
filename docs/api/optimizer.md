# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [optimizer](#optimizer)

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


