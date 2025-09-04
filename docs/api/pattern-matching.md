# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [pattern-matching](#pattern-matching)

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


