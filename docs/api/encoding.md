# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [encoding](#encoding)

## encoding

**File**: `src/stdlib/encoding.ts`

### Classes

#### Encoding

**Methods**:

##### toBase64

Encode string to Base64

**Signature**: `static toBase64(input: string): string`

##### fromBase64

Decode Base64 to string

**Signature**: `static fromBase64(input: string): string`

##### urlEncode

URL encode (percent encoding)

**Signature**: `static urlEncode(input: string): string`

##### urlDecode

URL decode

**Signature**: `static urlDecode(input: string): string`

##### htmlEncode

HTML encode (escape HTML entities)

**Signature**: `static htmlEncode(input: string): string`

##### htmlDecode

HTML decode (unescape HTML entities)

**Signature**: `static htmlDecode(input: string): string`

##### toHex

Hex encode

**Signature**: `static toHex(input: string): string`

##### fromHex

Hex decode

**Signature**: `static fromHex(input: string): string`

##### toBinary

Binary encode (string to binary representation)

**Signature**: `static toBinary(input: string): string`

##### fromBinary

Binary decode (binary representation to string)

**Signature**: `static fromBinary(input: string): string`

##### toUnicodeEscape

Unicode escape encoding

**Signature**: `static toUnicodeEscape(input: string): string`

##### fromUnicodeEscape

Unicode escape decoding

**Signature**: `static fromUnicodeEscape(input: string): string`

##### rot13

ROT13 encoding/decoding

**Signature**: `static rot13(input: string): string`

##### caesarEncode

Caesar cipher encoding

**Signature**: `static caesarEncode(input: string, shift: number): string`

##### caesarDecode

Caesar cipher decoding

**Signature**: `static caesarDecode(input: string, shift: number): string`

##### isValidBase64

Check if string is valid Base64

**Signature**: `static isValidBase64(input: string): boolean`

##### isValidHex

Check if string is valid hex

**Signature**: `static isValidHex(input: string): boolean`

##### isValidUrlEncoded

Check if string is valid URL encoding

**Signature**: `static isValidUrlEncoded(input: string): boolean`

##### analyze

Get encoding information about a string

**Signature**: `static analyze(input: string):`

##### base64Encode

**Signature**: `private static base64Encode(input: string): string`

##### base64Decode

**Signature**: `private static base64Decode(input: string): string`


