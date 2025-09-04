# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [security](#security)

## security

**File**: `/home/runner/work/Omniscript/Omniscript/src/security/index.ts`

### Classes

#### SecurityManager

**Properties**:

- `instance: SecurityManager` - 
- `defaultPolicy: SecurityPolicy` - 
- `auditLog: Array<{
    timestamp: number;
    action: string;
    allowed: boolean;
    context: any;
  }>` - 

**Methods**:

##### getInstance

**Signature**: `static getInstance(): SecurityManager`

##### createSandbox

**Signature**: `createSandbox(policy?: Partial<SecurityPolicy>): SandboxedEnvironment`

##### checkResourceAccess

**Signature**: `checkResourceAccess(action: string, resource: string, context: ExecutionContext): boolean`

##### evaluateAccess

**Signature**: `private evaluateAccess(action: string, resource: string, context: ExecutionContext): boolean`

##### checkModuleAccess

**Signature**: `private checkModuleAccess(moduleName: string, policy: SecurityPolicy): boolean`

##### logAction

**Signature**: `private logAction(action: string, allowed: boolean, context: any): void`

##### sanitizeContext

**Signature**: `private sanitizeContext(context: ExecutionContext): any`

##### getAuditLog

**Signature**: `getAuditLog(since?: number): Array<any>`

##### clearAuditLog

**Signature**: `clearAuditLog(): void`

#### SandboxedEnvironment

**Properties**:

- `context: ExecutionContext` - 
- `originalConsole: Console` - 
- `sandboxedGlobals: any` - 

**Methods**:

##### setupSandboxedEnvironment

**Signature**: `private setupSandboxedEnvironment(): void`

##### createSandboxedConsole

**Signature**: `private createSandboxedConsole(): Console`

##### createRestrictedFunction

**Signature**: `private createRestrictedFunction(name: string): Function`

##### createRestrictedRequire

**Signature**: `private createRestrictedRequire(): Function`

##### createRestrictedImport

**Signature**: `private createRestrictedImport(): Function`

##### execute

**Signature**: `execute(code: string): Promise<any>`

##### checkExecutionLimits

**Signature**: `private checkExecutionLimits(): void`

##### executeInIsolation

**Signature**: `private executeInIsolation(code: string): any`

##### getResourceUsage

**Signature**: `getResourceUsage():`

##### destroy

**Signature**: `destroy(): void`

#### SecurityError

**Extends**: `OmniscriptError`

#### ResourceLimitExceededError

**Extends**: `SecurityError`

#### ResourceMonitor

**Properties**:

- `intervals: Map<string, NodeJS.Timeout>` - 

**Methods**:

##### startMonitoring

**Signature**: `static startMonitoring(name: string, limits: ResourceLimits, callback: (usage: any) => void): void`

##### stopMonitoring

**Signature**: `static stopMonitoring(name: string): void`

##### getCurrentUsage

**Signature**: `private static getCurrentUsage(): any`

### Interfaces

#### SecurityPolicy

**Properties**:

- `allowFileSystem: boolean` - 
- `allowNetwork: boolean` - 
- `allowProcessExecution: boolean` - 
- `maxMemoryMB: number` - 
- `maxExecutionTimeMs: number` - 
- `maxCallStackDepth: number` - 
- `allowedModules: string[]` - 
- `deniedFunctions: string[]` - 

#### ResourceLimits

**Properties**:

- `maxMemoryBytes: number` - 
- `maxCpuTimeMs: number` - 
- `maxFileDescriptors: number` - 
- `maxNetworkConnections: number` - 

#### ExecutionContext

**Properties**:

- `policy: SecurityPolicy` - 
- `startTime: number` - 
- `memoryUsage: number` - 
- `callStackDepth: number` - 
- `openFileDescriptors: Set<string>` - 
- `networkConnections: Set<string>` - 


