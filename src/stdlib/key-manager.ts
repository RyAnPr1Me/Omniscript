/**
 * Production-grade key management for OmniCodec encryption
 */

import { Crypto } from './crypto';
import { EncryptionError } from './media-errors';
import { debug } from '../debug';

export interface EncryptionKeyData {
  key: string;
  iv: string;
  algorithm: string;
  keyId: string;
  created: number;
}

export interface KeyManagerOptions {
  defaultAlgorithm?: 'AES-GCM' | 'AES-CBC';
  keyRotationInterval?: number; // milliseconds
  maxStoredKeys?: number;
}

/**
 * Secure key management for OmniCodec encryption
 * In production, this would integrate with external key management services
 */
export class KeyManager {
  private keys: Map<string, EncryptionKeyData> = new Map();
  private options: Required<KeyManagerOptions>;

  constructor(options: KeyManagerOptions = {}) {
    this.options = {
      defaultAlgorithm: options.defaultAlgorithm || 'AES-GCM',
      keyRotationInterval: options.keyRotationInterval || 24 * 60 * 60 * 1000, // 24 hours
      maxStoredKeys: options.maxStoredKeys || 100
    };

    debug.info('Media', 'KeyManager initialized with security options');
  }

  /**
   * Generate a new encryption key
   */
  async generateKey(algorithm?: 'AES-GCM' | 'AES-CBC'): Promise<EncryptionKeyData> {
    try {
      const keyAlgorithm = algorithm || this.options.defaultAlgorithm;
      const keyId = Crypto.generateUUID();
      const key = await Crypto.generateKey(32); // 256-bit key
      const iv = this.generateIV(keyAlgorithm);
      
      const keyData: EncryptionKeyData = {
        key,
        iv,
        algorithm: keyAlgorithm,
        keyId,
        created: Date.now()
      };

      // Store the key
      this.storeKey(keyData);
      
      debug.debug('Media', `Generated new encryption key: ${keyId}`);
      return keyData;
    } catch (error) {
      throw new EncryptionError(`Failed to generate encryption key: ${error}`);
    }
  }

  /**
   * Retrieve a key by ID
   */
  getKey(keyId: string): EncryptionKeyData | null {
    return this.keys.get(keyId) || null;
  }

  /**
   * Store a key securely (in production, this would use external key storage)
   */
  private storeKey(keyData: EncryptionKeyData): void {
    // Cleanup old keys if we're at the limit
    if (this.keys.size >= this.options.maxStoredKeys) {
      this.cleanupOldKeys();
    }

    this.keys.set(keyData.keyId, keyData);
  }

  /**
   * Generate appropriate IV for the algorithm
   */
  private generateIV(algorithm: 'AES-GCM' | 'AES-CBC'): string {
    const ivLength = algorithm === 'AES-GCM' ? 12 : 16;
    const iv = Crypto.generateRandomBytes(ivLength);
    return Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Clean up old keys to prevent memory leaks
   */
  private cleanupOldKeys(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [keyId, keyData] of this.keys.entries()) {
      if (now - keyData.created > this.options.keyRotationInterval) {
        keysToDelete.push(keyId);
      }
    }

    // Delete oldest keys first if we still have too many
    if (keysToDelete.length === 0 && this.keys.size >= this.options.maxStoredKeys) {
      const sortedKeys = Array.from(this.keys.entries())
        .sort((a, b) => a[1].created - b[1].created);
      
      for (let i = 0; i < sortedKeys.length - this.options.maxStoredKeys + 1; i++) {
        keysToDelete.push(sortedKeys[i][0]);
      }
    }

    for (const keyId of keysToDelete) {
      this.keys.delete(keyId);
    }

    if (keysToDelete.length > 0) {
      debug.debug('Media', `Cleaned up ${keysToDelete.length} old encryption keys`);
    }
  }

  /**
   * Check if a key needs rotation
   */
  shouldRotateKey(keyData: EncryptionKeyData): boolean {
    return Date.now() - keyData.created > this.options.keyRotationInterval;
  }

  /**
   * Get encryption info that can be safely stored in the header
   */
  getEncryptionInfo(keyData: EncryptionKeyData): { keyId: string; algorithm: string } {
    return {
      keyId: keyData.keyId,
      algorithm: keyData.algorithm
    };
  }

  /**
   * Derive a key from a password (for password-based encryption)
   */
  async deriveKeyFromPassword(password: string, salt?: string): Promise<EncryptionKeyData> {
    try {
      const actualSalt = salt || Crypto.generateSalt(16);
      const derivedKey = await Crypto.deriveKey(password, actualSalt);
      const keyId = await Crypto.hash(`${password}:${actualSalt}`, 'SHA-256');
      
      const keyData: EncryptionKeyData = {
        key: derivedKey,
        iv: this.generateIV(this.options.defaultAlgorithm),
        algorithm: this.options.defaultAlgorithm,
        keyId: keyId.substring(0, 32), // Truncate to reasonable length
        created: Date.now()
      };

      // Don't store password-derived keys in memory for security
      debug.debug('Media', 'Derived encryption key from password');
      return keyData;
    } catch (error) {
      throw new EncryptionError(`Failed to derive key from password: ${error}`);
    }
  }

  /**
   * Clear all stored keys (for security)
   */
  clearAllKeys(): void {
    this.keys.clear();
    debug.info('Media', 'All encryption keys cleared');
  }

  /**
   * Get statistics about stored keys
   */
  getKeyStats(): { totalKeys: number; oldestKey: number; newestKey: number } {
    if (this.keys.size === 0) {
      return { totalKeys: 0, oldestKey: 0, newestKey: 0 };
    }

    const timestamps = Array.from(this.keys.values()).map(k => k.created);
    return {
      totalKeys: this.keys.size,
      oldestKey: Math.min(...timestamps),
      newestKey: Math.max(...timestamps)
    };
  }
}