# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [regex](#regex)

## regex

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/regex.ts`

### Classes

#### Regex

**Properties**:

- `pattern: RegExp` - 
- `patterns: any` - 

**Methods**:

##### test

Test if pattern matches string

**Signature**: `test(input: string): boolean`

##### match

Find first match in string

**Signature**: `match(input: string): RegexMatch | null`

##### matchAll

Find all matches in string

**Signature**: `matchAll(input: string): RegexMatch[]`

##### replace

Replace matches in string

**Signature**: `replace(input: string, replacement: string | ((match: RegexMatch) => string)): string`

##### split

Split string by regex pattern

**Signature**: `split(input: string, limit?: number): string[]`

##### toString

Get the regex pattern as string

**Signature**: `toString(): string`

##### escape

Escape special regex characters in string

**Signature**: `static escape(input: string): string`

##### create

Create regex from string with flags

**Signature**: `static create(pattern: string, options?: RegexReplaceOptions): Regex`

##### test

Test if string matches pattern

**Signature**: `static test(pattern: string, input: string, flags?: string): boolean`

##### match

Find first match

**Signature**: `static match(pattern: string, input: string, flags?: string): RegexMatch | null`

##### matchAll

Find all matches

**Signature**: `static matchAll(pattern: string, input: string, flags?: string): RegexMatch[]`

##### replace

Replace matches

**Signature**: `static replace(pattern: string, input: string, replacement: string | ((match: RegexMatch) => string), flags?: string): string`

##### split

Split string

**Signature**: `static split(pattern: string, input: string, limit?: number, flags?: string): string[]`

##### isEmail

Validate email format

**Signature**: `static isEmail(input: string): boolean`

##### isUrl

Validate URL format

**Signature**: `static isUrl(input: string): boolean`

##### isPhone

Validate phone number format

**Signature**: `static isPhone(input: string): boolean`

##### isIPv4

Validate IPv4 address format

**Signature**: `static isIPv4(input: string): boolean`

##### isIPv6

Validate IPv6 address format

**Signature**: `static isIPv6(input: string): boolean`

##### isUUID

Validate UUID format

**Signature**: `static isUUID(input: string): boolean`

##### isHexColor

Validate hex color format

**Signature**: `static isHexColor(input: string): boolean`

##### extractEmails

Extract all email addresses from text

**Signature**: `static extractEmails(text: string): string[]`

##### extractUrls

Extract all URLs from text

**Signature**: `static extractUrls(text: string): string[]`

### Interfaces

#### RegexMatch

**Properties**:

- `match: string` - 
- `index: number` - 
- `groups: string[]` - 
- `namedGroups: Record<string, string>` - 

#### RegexReplaceOptions

**Properties**:

- `global: boolean` - 
- `ignoreCase: boolean` - 
- `multiline: boolean` - 
- `dotAll: boolean` - 
- `unicode: boolean` - 
- `sticky: boolean` - 


