# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [path](#path)

## path

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/path.ts`

### Classes

#### Path

**Methods**:

##### join

Join path segments into a normalized path

**Signature**: `static join(...paths: string[]): string`

##### resolve

Resolve path segments into an absolute path

**Signature**: `static resolve(...paths: string[]): string`

##### relative

Get relative path from 'from' to 'to'

**Signature**: `static relative(from: string, to: string): string`

##### normalize

Normalize a path, resolving '..' and '.' segments

**Signature**: `static normalize(path: string): string`

##### isAbsolute

Check if path is absolute

**Signature**: `static isAbsolute(path: string): boolean`

##### dirname

Get the directory name of a path

**Signature**: `static dirname(path: string): string`

##### basename

Get the base name of a path

**Signature**: `static basename(path: string, ext?: string): string`

##### extname

Get the extension of a path

**Signature**: `static extname(path: string): string`

##### parse

Parse a path into its components

**Signature**: `static parse(path: string): ParsedPath`

##### format

Format a path object into a path string

**Signature**: `static format(pathObject: Partial<ParsedPath>): string`

##### toPosix

Convert path to use forward slashes (POSIX-style)

**Signature**: `static toPosix(path: string): string`

##### toWindows

Convert path to use backslashes (Windows-style)

**Signature**: `static toWindows(path: string): string`

##### getCurrentDirectory

Get current working directory

**Signature**: `private static getCurrentDirectory(): string`

##### equals

Check if two paths are the same

**Signature**: `static equals(path1: string, path2: string): boolean`

##### commonPrefix

Get the common prefix of multiple paths

**Signature**: `static commonPrefix(...paths: string[]): string`

##### isWithin

Check if a path is within another path

**Signature**: `static isWithin(parent: string, child: string): boolean`

##### stem

Get file name without extension

**Signature**: `static stem(path: string): string`

##### changeExtension

Change file extension

**Signature**: `static changeExtension(path: string, newExt: string): string`

##### addSuffix

Add suffix to file name (before extension)

**Signature**: `static addSuffix(path: string, suffix: string): string`

##### addPrefix

Add prefix to file name

**Signature**: `static addPrefix(path: string, prefix: string): string`

### Interfaces

#### ParsedPath

**Properties**:

- `root: string` - 
- `dir: string` - 
- `base: string` - 
- `ext: string` - 
- `name: string` - 


