# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [type-checker](#type-checker)

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


