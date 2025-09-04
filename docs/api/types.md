# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [types](#types)

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


