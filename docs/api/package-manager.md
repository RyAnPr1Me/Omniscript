# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [package-manager](#package-manager)

## package-manager

**File**: `/home/runner/work/Omniscript/Omniscript/src/package-manager/index.ts`

### Classes

#### PackageManager

**Properties**:

- `config: PackageConfig` - 

**Methods**:

##### loadConfig

**Signature**: `async loadConfig(path: string = 'package.json'): Promise<void>`

##### installDependency

**Signature**: `async installDependency(name: string, version: string): Promise<void>`

##### enableStdLib

**Signature**: `async enableStdLib(module: string): Promise<void>`

##### enableDebugger

**Signature**: `async enableDebugger(): Promise<void>`

##### enableProfiler

**Signature**: `async enableProfiler(): Promise<void>`

##### enableAutocomplete

**Signature**: `async enableAutocomplete(): Promise<void>`

##### enableLinting

**Signature**: `async enableLinting(): Promise<void>`

##### enableRefactoringTools

**Signature**: `async enableRefactoringTools(): Promise<void>`

##### listAvailableLibraries

**Signature**: `async listAvailableLibraries(): Promise<string[]>`

##### listAvailablePlugins

**Signature**: `async listAvailablePlugins(): Promise<string[]>`

##### searchRegistry

**Signature**: `async searchRegistry(query: string): Promise<string[]>`

##### saveConfig

**Signature**: `private async saveConfig(): Promise<void>`

### Interfaces

#### PackageConfig

**Properties**:

- `name: string` - 
- `version: string` - 
- `dependencies: Record<string, string>` - 
- `omniscript: {
    stdlib?: string[];
    plugins?: string[];
  }` - 


