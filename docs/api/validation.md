# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [validation](#validation)

## validation

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/validation.ts`

### Classes

#### Validator

**Properties**:

- `rules: Map<string, ValidatorFunction[]>` - 
- `transforms: Map<string, ((value: any) => any)[]>` - 

**Methods**:

##### string

**Signature**: `static string(options:`

##### number

**Signature**: `static number(options:`

##### boolean

**Signature**: `static boolean(): ValidatorFunction<boolean>`

##### array

**Signature**: `static array<T>(itemValidator?: ValidatorFunction<T>, options:`

##### object

**Signature**: `static object(schema: Record<string, ValidatorFunction>): ValidatorFunction<Record<string, any>>`

##### email

**Signature**: `static email(): ValidatorFunction<string>`

##### url

**Signature**: `static url(): ValidatorFunction<string>`

##### date

**Signature**: `static date(): ValidatorFunction<Date>`

##### enum

**Signature**: `static enum<T extends string | number>(allowedValues: T[]): ValidatorFunction<T>`

##### optional

**Signature**: `static optional<T>(validator: ValidatorFunction<T>): ValidatorFunction<T | undefined>`

##### required

**Signature**: `static required<T>(validator: ValidatorFunction<T>): ValidatorFunction<T>`

##### oneOf

**Signature**: `static oneOf<T>(...validators: ValidatorFunction<T>[]): ValidatorFunction<T>`

##### allOf

**Signature**: `static allOf<T>(...validators: ValidatorFunction<T>[]): ValidatorFunction<T>`

##### field

**Signature**: `field(fieldName: string): FieldValidator`

##### addRule

**Signature**: `addRule(field: string, validator: ValidatorFunction): this`

##### addTransform

**Signature**: `addTransform(field: string, transform: (value: any) => any): this`

##### validate

**Signature**: `validate(data: Record<string, any>): ValidationResult`

#### FieldValidator

**Methods**:

##### string

**Signature**: `string(options?: Parameters<typeof Validator.string>[0]): this`

##### number

**Signature**: `number(options?: Parameters<typeof Validator.number>[0]): this`

##### boolean

**Signature**: `boolean(): this`

##### email

**Signature**: `email(): this`

##### url

**Signature**: `url(): this`

##### date

**Signature**: `date(): this`

##### enum

**Signature**: `enum<T extends string | number>(values: T[]): this`

##### required

**Signature**: `required(): this`

##### optional

**Signature**: `optional(): this`

##### transform

**Signature**: `transform(fn: (value: any) => any): this`

##### custom

**Signature**: `custom(validator: ValidatorFunction): this`

#### Sanitizer

**Methods**:

##### escapeHtml

**Signature**: `static escapeHtml(input: string): string`

##### stripTags

**Signature**: `static stripTags(input: string): string`

##### normalizeWhitespace

**Signature**: `static normalizeWhitespace(input: string): string`

##### removeSpecialChars

**Signature**: `static removeSpecialChars(input: string, allowed: string = ''): string`

##### truncate

**Signature**: `static truncate(input: string, maxLength: number, suffix: string = '...'): string`

##### slug

**Signature**: `static slug(input: string): string`

### Interfaces

#### ValidationError

**Properties**:

- `field: string` - 
- `message: string` - 
- `code: string` - 
- `value: any` - 

#### ValidationResult

**Properties**:

- `isValid: boolean` - 
- `errors: ValidationError[]` - 
- `sanitizedValue: any` - 


