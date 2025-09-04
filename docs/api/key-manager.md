# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [key-manager](#key-manager)

## key-manager

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/key-manager.ts`

### Classes

#### KeyManager

Secure key management for OmniCodec encryption
In production, this would integrate with external key management services

**Properties**:

- `keys: Map<string, EncryptionKeyData>` - 
- `options: Required<KeyManagerOptions>` - 

**Methods**:

##### generateKey

Generate a new encryption key

**Signature**: `async generateKey(algorithm?: 'AES-GCM' | 'AES-CBC'): Promise<EncryptionKeyData>`

##### getKey

Retrieve a key by ID

**Signature**: `getKey(keyId: string): EncryptionKeyData | null`

##### storeKey

Store a key securely (in production, this would use external key storage)

**Signature**: `private storeKey(keyData: EncryptionKeyData): void`

##### generateIV

Generate appropriate IV for the algorithm

**Signature**: `private generateIV(algorithm: 'AES-GCM' | 'AES-CBC'): string`

##### cleanupOldKeys

Clean up old keys to prevent memory leaks

**Signature**: `private cleanupOldKeys(): void`

##### shouldRotateKey

Check if a key needs rotation

**Signature**: `shouldRotateKey(keyData: EncryptionKeyData): boolean`

##### getEncryptionInfo

Get encryption info that can be safely stored in the header

**Signature**: `getEncryptionInfo(keyData: EncryptionKeyData):`

##### deriveKeyFromPassword

Derive a key from a password (for password-based encryption)

**Signature**: `async deriveKeyFromPassword(password: string, salt?: string): Promise<EncryptionKeyData>`

##### clearAllKeys

Clear all stored keys (for security)

**Signature**: `clearAllKeys(): void`

##### getKeyStats

Get statistics about stored keys

**Signature**: `getKeyStats():`

### Interfaces

#### EncryptionKeyData

**Properties**:

- `key: string` - 
- `iv: string` - 
- `algorithm: string` - 
- `keyId: string` - 
- `created: number` - 

#### KeyManagerOptions

**Properties**:

- `defaultAlgorithm: 'AES-GCM' | 'AES-CBC'` - 
- `keyRotationInterval: number` - 
- `maxStoredKeys: number` - 


