# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [aot](#aot)

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


