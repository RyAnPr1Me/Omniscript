# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [crypto](#crypto)

## crypto

**File**: `src/stdlib/crypto.ts`

### Classes

#### Crypto

**Methods**:

##### hash

**Signature**: `static async hash(data: string, algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256'): Promise<string>`

##### md5

**Signature**: `static async md5(data: string): Promise<string>`

##### hmac

**Signature**: `static async hmac(data: string, key: string, algorithm: 'SHA-256' | 'SHA-512' = 'SHA-256'): Promise<string>`

##### encrypt

**Signature**: `static async encrypt(data: string, key: string, algorithm: 'AES-GCM' | 'AES-CBC' = 'AES-GCM'): Promise<EncryptionResult>`

##### decrypt

**Signature**: `static async decrypt(encryptionResult: EncryptionResult, key: string): Promise<string>`

##### generateKey

**Signature**: `static async generateKey(length: number = 32): Promise<string>`

##### generateKeyPair

**Signature**: `static async generateKeyPair(algorithm: 'RSA-OAEP' | 'ECDSA' = 'RSA-OAEP'): Promise<KeyPair>`

##### sign

**Signature**: `static async sign(data: string, privateKey: string, algorithm: 'ECDSA' | 'RSA-PSS' = 'ECDSA'): Promise<string>`

##### verify

**Signature**: `static async verify(data: string, signature: string, publicKey: string, algorithm: 'ECDSA' | 'RSA-PSS' = 'ECDSA'): Promise<boolean>`

##### generateRandomBytes

**Signature**: `static generateRandomBytes(length: number): Uint8Array`

##### generateRandomString

**Signature**: `static generateRandomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string`

##### generateUUID

**Signature**: `static generateUUID(): string`

##### deriveKey

**Signature**: `static async deriveKey(password: string, salt: string, iterations: number = 100000): Promise<string>`

##### generateSalt

**Signature**: `static generateSalt(length: number = 16): string`

##### bufferToBase64

**Signature**: `private static bufferToBase64(buffer: ArrayBuffer): string`

##### base64ToBuffer

**Signature**: `private static base64ToBuffer(base64: string): ArrayBuffer`

##### arrayToBase64

**Signature**: `private static arrayToBase64(array: Uint8Array): string`

##### base64ToArray

**Signature**: `private static base64ToArray(base64: string): Uint8Array`

##### simpleMD5

**Signature**: `private static simpleMD5(data: string): string`

### Interfaces

#### EncryptionResult

**Properties**:

- `encrypted: string` - 
- `iv: string` - 
- `algorithm: string` - 

#### KeyPair

**Properties**:

- `publicKey: string` - 
- `privateKey: string` - 


