# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [fuzzer](#fuzzer)

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


