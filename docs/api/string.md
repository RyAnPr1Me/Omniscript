# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [string](#string)

## string

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/string.ts`

### Classes

#### StringUtils

**Methods**:

##### isEmpty

Check if string is empty or only whitespace

**Signature**: `static isEmpty(str: string): boolean`

##### isNotEmpty

Check if string is not empty

**Signature**: `static isNotEmpty(str: string): boolean`

##### capitalize

Capitalize first letter of string

**Signature**: `static capitalize(str: string, options?: StringCaseOptions): string`

##### camelCase

Convert string to camelCase

**Signature**: `static camelCase(str: string): string`

##### pascalCase

Convert string to PascalCase

**Signature**: `static pascalCase(str: string): string`

##### kebabCase

Convert string to kebab-case

**Signature**: `static kebabCase(str: string): string`

##### snakeCase

Convert string to snake_case

**Signature**: `static snakeCase(str: string): string`

##### pad

Pad string to specified length

**Signature**: `static pad(str: string, length: number, options?: StringPadOptions): string`

##### truncate

Truncate string to max length with optional suffix

**Signature**: `static truncate(str: string, maxLength: number, suffix: string = '...'): string`

##### repeat

Repeat string n times with optional separator

**Signature**: `static repeat(str: string, count: number, separator: string = ''): string`

##### removeWhitespace

Remove all whitespace from string

**Signature**: `static removeWhitespace(str: string): string`

##### normalizeWhitespace

Normalize whitespace (replace multiple spaces with single space)

**Signature**: `static normalizeWhitespace(str: string): string`

##### reverse

Reverse string

**Signature**: `static reverse(str: string): string`

##### count

Count occurrences of substring

**Signature**: `static count(str: string, search: string): number`

##### isNumeric

Check if string contains only digits

**Signature**: `static isNumeric(str: string): boolean`

##### isAlpha

Check if string contains only letters

**Signature**: `static isAlpha(str: string): boolean`

##### isAlphanumeric

Check if string contains only letters and digits

**Signature**: `static isAlphanumeric(str: string): boolean`

##### isEmail

Check if string is a valid email

**Signature**: `static isEmail(str: string): boolean`

##### isUrl

Check if string is a valid URL

**Signature**: `static isUrl(str: string): boolean`

##### extractEmails

Extract all email addresses from string

**Signature**: `static extractEmails(str: string): string[]`

##### extractUrls

Extract all URLs from string

**Signature**: `static extractUrls(str: string): string[]`

##### random

Generate random string of specified length

**Signature**: `static random(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string`

##### randomAlphanumeric

Generate random alphanumeric string

**Signature**: `static randomAlphanumeric(length: number): string`

##### randomAlpha

Generate random alphabetic string

**Signature**: `static randomAlpha(length: number): string`

##### randomNumeric

Generate random numeric string

**Signature**: `static randomNumeric(length: number): string`

##### uuid

Generate UUID v4

**Signature**: `static uuid(): string`

##### levenshteinDistance

Calculate Levenshtein distance between two strings

**Signature**: `static levenshteinDistance(str1: string, str2: string): number`

##### similarity

Calculate string similarity (0-1 based on Levenshtein distance)

**Signature**: `static similarity(str1: string, str2: string): number`

##### splitAndTrim

Split string and trim each part

**Signature**: `static splitAndTrim(str: string, separator: string | RegExp): string[]`

##### joinNatural

Join array with different separators for last item

**Signature**: `static joinNatural(items: string[], separator: string = ', ', lastSeparator: string = ' and '): string`

##### escapeHtml

Escape HTML special characters

**Signature**: `static escapeHtml(str: string): string`

##### unescapeHtml

Unescape HTML entities

**Signature**: `static unescapeHtml(str: string): string`

##### titleCase

Convert string to title case

**Signature**: `static titleCase(str: string): string`

##### words

Extract words from string

**Signature**: `static words(str: string): string[]`

##### wordCount

Count words in string

**Signature**: `static wordCount(str: string): number`

### Interfaces

#### StringPadOptions

**Properties**:

- `character: string` - 
- `side: 'left' | 'right' | 'both'` - 

#### StringCaseOptions

**Properties**:

- `locale: string` - 


