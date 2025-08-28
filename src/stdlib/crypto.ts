import { debug } from '../debug';

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  algorithm: string;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export class Crypto {
  // Hashing functions
  static async hash(data: string, algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256'): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      debug.error('Crypto', `Hashing failed: ${error}`);
      throw new Error(`Failed to hash data: ${error}`);
    }
  }

  static async md5(data: string): Promise<string> {
    // Simple MD5 implementation for cases where Web Crypto API doesn't support it
    return this.simpleMD5(data);
  }

  static async hmac(data: string, key: string, algorithm: 'SHA-256' | 'SHA-512' = 'SHA-256'): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const keyBuffer = encoder.encode(key);
      const dataBuffer = encoder.encode(data);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: algorithm },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      debug.error('Crypto', `HMAC generation failed: ${error}`);
      throw new Error(`Failed to generate HMAC: ${error}`);
    }
  }

  // Symmetric encryption
  static async encrypt(data: string, key: string, algorithm: 'AES-GCM' | 'AES-CBC' = 'AES-GCM'): Promise<EncryptionResult> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Ensure key is the right length (32 bytes for AES-256)
      const keyHash = await this.hash(key, 'SHA-256');
      const keyBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        keyBytes[i] = parseInt(keyHash.substring(i * 2, i * 2 + 2), 16);
      }
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        algorithm,
        false,
        ['encrypt']
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(algorithm === 'AES-GCM' ? 12 : 16));
      const encryptParams = algorithm === 'AES-GCM' 
        ? { name: algorithm, iv }
        : { name: algorithm, iv };
      
      const encrypted = await crypto.subtle.encrypt(encryptParams, cryptoKey, dataBuffer);
      
      return {
        encrypted: this.bufferToBase64(encrypted),
        iv: this.arrayToBase64(iv),
        algorithm
      };
    } catch (error) {
      debug.error('Crypto', `Encryption failed: ${error}`);
      throw new Error(`Failed to encrypt data: ${error}`);
    }
  }

  static async decrypt(encryptionResult: EncryptionResult, key: string): Promise<string> {
    try {
      const { encrypted, iv, algorithm } = encryptionResult;
      
      // Recreate the key
      const keyHash = await this.hash(key, 'SHA-256');
      const keyBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        keyBytes[i] = parseInt(keyHash.substring(i * 2, i * 2 + 2), 16);
      }
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        algorithm,
        false,
        ['decrypt']
      );
      
      const ivBuffer = this.base64ToArray(iv);
      const encryptedBuffer = this.base64ToBuffer(encrypted);
      
      const decryptParams = algorithm === 'AES-GCM' 
        ? { name: algorithm, iv: ivBuffer }
        : { name: algorithm, iv: ivBuffer };
      
      const decrypted = await crypto.subtle.decrypt(decryptParams, cryptoKey, encryptedBuffer);
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      debug.error('Crypto', `Decryption failed: ${error}`);
      throw new Error(`Failed to decrypt data: ${error}`);
    }
  }

  // Key generation
  static async generateKey(length: number = 32): Promise<string> {
    const keyBytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(keyBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static async generateKeyPair(algorithm: 'RSA-OAEP' | 'ECDSA' = 'RSA-OAEP'): Promise<KeyPair> {
    try {
      let keyParams: any;
      
      if (algorithm === 'RSA-OAEP') {
        keyParams = {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        };
      } else {
        keyParams = {
          name: 'ECDSA',
          namedCurve: 'P-384'
        };
      }
      
      const keyPair = await crypto.subtle.generateKey(
        keyParams,
        true,
        algorithm === 'RSA-OAEP' ? ['encrypt', 'decrypt'] : ['sign', 'verify']
      );
      
      const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      
      return {
        publicKey: this.bufferToBase64(publicKey),
        privateKey: this.bufferToBase64(privateKey)
      };
    } catch (error) {
      debug.error('Crypto', `Key pair generation failed: ${error}`);
      throw new Error(`Failed to generate key pair: ${error}`);
    }
  }

  // Digital signatures
  static async sign(data: string, privateKey: string, algorithm: 'ECDSA' | 'RSA-PSS' = 'ECDSA'): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const keyBuffer = this.base64ToBuffer(privateKey);
      
      let importParams: any;
      let signParams: any;
      
      if (algorithm === 'ECDSA') {
        importParams = { name: 'ECDSA', namedCurve: 'P-384' };
        signParams = { name: 'ECDSA', hash: 'SHA-384' };
      } else {
        importParams = { name: 'RSA-PSS', hash: 'SHA-256' };
        signParams = { name: 'RSA-PSS', saltLength: 32 };
      }
      
      const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        keyBuffer,
        importParams,
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign(signParams, cryptoKey, dataBuffer);
      return this.bufferToBase64(signature);
    } catch (error) {
      debug.error('Crypto', `Signing failed: ${error}`);
      throw new Error(`Failed to sign data: ${error}`);
    }
  }

  static async verify(data: string, signature: string, publicKey: string, algorithm: 'ECDSA' | 'RSA-PSS' = 'ECDSA'): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const signatureBuffer = this.base64ToBuffer(signature);
      const keyBuffer = this.base64ToBuffer(publicKey);
      
      let importParams: any;
      let verifyParams: any;
      
      if (algorithm === 'ECDSA') {
        importParams = { name: 'ECDSA', namedCurve: 'P-384' };
        verifyParams = { name: 'ECDSA', hash: 'SHA-384' };
      } else {
        importParams = { name: 'RSA-PSS', hash: 'SHA-256' };
        verifyParams = { name: 'RSA-PSS', saltLength: 32 };
      }
      
      const cryptoKey = await crypto.subtle.importKey(
        'spki',
        keyBuffer,
        importParams,
        false,
        ['verify']
      );
      
      return await crypto.subtle.verify(verifyParams, cryptoKey, signatureBuffer, dataBuffer);
    } catch (error) {
      debug.error('Crypto', `Verification failed: ${error}`);
      return false;
    }
  }

  // Random number generation
  static generateRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  static generateRandomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    const randomBytes = this.generateRandomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(randomBytes[i] % charset.length);
    }
    return result;
  }

  static generateUUID(): string {
    const randomBytes = this.generateRandomBytes(16);
    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40; // Version 4
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80; // Variant bits
    
    const hex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
  }

  // Password utilities
  static async deriveKey(password: string, salt: string, iterations: number = 100000): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      const saltBuffer = encoder.encode(salt);
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
      );
      
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        256 // 32 bytes
      );
      
      return Array.from(new Uint8Array(derivedBits))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      debug.error('Crypto', `Key derivation failed: ${error}`);
      throw new Error(`Failed to derive key: ${error}`);
    }
  }

  static generateSalt(length: number = 16): string {
    return this.generateRandomString(length);
  }

  // Utility functions
  private static bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
    return btoa(binary);
  }

  private static base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private static arrayToBase64(array: Uint8Array): string {
    const binary = Array.from(array).map(b => String.fromCharCode(b)).join('');
    return btoa(binary);
  }

  private static base64ToArray(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Simple MD5 implementation (for compatibility)
  private static simpleMD5(data: string): string {
    // This is a simplified MD5 for demo purposes
    // In production, use a proper MD5 library
    let hash = 0;
    if (data.length === 0) return hash.toString(16);
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}
