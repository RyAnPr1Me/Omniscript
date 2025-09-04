# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [fs](#fs)

## fs

**File**: `src/stdlib/fs.ts`

### Classes

#### FileSystem

**Methods**:

##### readFile

Read file contents as string

**Signature**: `static async readFile(path: string, encoding: string = 'utf8'): Promise<string>`

##### writeFile

Write string content to file

**Signature**: `static async writeFile(path: string, data: string, encoding: string = 'utf8'): Promise<void>`

##### appendFile

Append string content to file

**Signature**: `static async appendFile(path: string, data: string, encoding: string = 'utf8'): Promise<void>`

##### exists

Check if file or directory exists

**Signature**: `static async exists(path: string): Promise<boolean>`

##### stat

Get file/directory statistics

**Signature**: `static async stat(path: string): Promise<FileStats>`

##### mkdir

Create directory (and parent directories if needed)

**Signature**: `static async mkdir(path: string, recursive: boolean = false): Promise<void>`

##### remove

Remove file or directory

**Signature**: `static async remove(path: string, recursive: boolean = false): Promise<void>`

##### readDir

List directory contents

**Signature**: `static async readDir(path: string): Promise<DirectoryEntry[]>`

##### copy

Copy file from source to destination

**Signature**: `static async copy(source: string, destination: string): Promise<void>`

##### move

Move/rename file or directory

**Signature**: `static async move(source: string, destination: string): Promise<void>`

##### createReadStream

Create a readable stream for large files

**Signature**: `static createReadStream(path: string, options?:`

##### createWriteStream

Create a writable stream for large files

**Signature**: `static createWriteStream(path: string, options?:`

### Interfaces

#### FileStats

**Properties**:

- `size: number` - 
- `isFile: boolean` - 
- `isDirectory: boolean` - 
- `isSymbolicLink: boolean` - 
- `created: Date` - 
- `modified: Date` - 
- `accessed: Date` - 

#### DirectoryEntry

**Properties**:

- `name: string` - 
- `type: 'file' | 'directory' | 'symlink'` - 
- `size: number` - 


