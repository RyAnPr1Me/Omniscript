# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [metaprogramming](#metaprogramming)

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


