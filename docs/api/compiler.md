# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [compiler](#compiler)

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


