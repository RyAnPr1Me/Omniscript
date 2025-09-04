# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [debug](#debug)

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


