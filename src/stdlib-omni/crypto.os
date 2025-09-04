// Crypto utilities library implemented in Omniscript
// This replaces the TypeScript-based src/stdlib/crypto.ts

interface EncryptionResult {
  encrypted:: string;
  iv:: string;
  algorithm:: string;
}

interface KeyPair {
  publicKey:: string;
  privateKey:: string;
}

class Crypto {
  // Hashing functions
  static async hash(data:: string, algorithm:: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256'):: Promise<string> {
    try {
      def encoder = new TextEncoder();
      def dataBuffer = encoder.encode(data);
      def hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
      return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    } catch (error) {
      console.error('Crypto: Hashing failed:', error);
      throw new Error(`Failed to hash data: ${error}`);
    }
  }

  static async md5(data:: string):: Promise<string> {
    // Simple MD5 implementation for cases where Web Crypto API doesn't support it
    return this.simpleMD5(data);
  }

  static async hmac(data:: string, key:: string, algorithm:: 'SHA-256' | 'SHA-512' = 'SHA-256'):: Promise<string> {
    try {
      def encoder = new TextEncoder();
      def keyBuffer = encoder.encode(key);
      def dataBuffer = encoder.encode(data);

      def cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: algorithm },
        false,
        ['sign']
      );

      def signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
      return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    } catch (error) {
      console.error('Crypto: HMAC generation failed:', error);
      throw new Error(`Failed to generate HMAC: ${error}`);
    }
  }

  // Symmetric encryption
  static async encrypt(data:: string, key:: string, algorithm:: 'AES-GCM' | 'AES-CBC' = 'AES-GCM'):: Promise<EncryptionResult> {
    try {
      def encoder = new TextEncoder();
      def dataBuffer = encoder.encode(data);

      // Ensure key is the right length (32 bytes for AES-256)
      def keyHash = await this.hash(key, 'SHA-256');
      def keyBytes = new Uint8Array(32);
      for (var i = 0; i < 32; i++) {
        keyBytes[i] = parseInt(keyHash.substring(i * 2, i * 2 + 2), 16);
      }

      def cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        algorithm,
        false,
        ['encrypt']
      );

      def iv = crypto.getRandomValues(new Uint8Array(algorithm === 'AES-GCM' ? 12 : 16));
      def encryptParams = algorithm === 'AES-GCM'
      ? { name: algorithm, iv }
      : { name: algorithm, iv };

      def encrypted = await crypto.subtle.encrypt(encryptParams, cryptoKey, dataBuffer);

      return {
        encrypted: this.bufferToBase64(encrypted),
        iv: this.arrayToBase64(iv),
        algorithm
      };
    } catch (error) {
      console.error('Crypto: Encryption failed:', error);
      throw new Error(`Failed to encrypt data: ${error}`);
    }
  }

  static async decrypt(encryptionResult:: EncryptionResult, key:: string):: Promise<string> {
    try {
      def { encrypted, iv, algorithm } = encryptionResult;

      // Recreate the key
      def keyHash = await this.hash(key, 'SHA-256');
      def keyBytes = new Uint8Array(32);
      for (var i = 0; i < 32; i++) {
        keyBytes[i] = parseInt(keyHash.substring(i * 2, i * 2 + 2), 16);
      }

      def cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        algorithm,
        false,
        ['decrypt']
      );

      def ivBuffer = this.base64ToArray(iv);
      def encryptedBuffer = this.base64ToBuffer(encrypted);

      def decryptParams = algorithm === 'AES-GCM'
      ? { name: algorithm, iv: ivBuffer }
      : { name: algorithm, iv: ivBuffer };

      def decrypted = await crypto.subtle.decrypt(decryptParams, cryptoKey, encryptedBuffer);

      def decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Crypto: Decryption failed:', error);
      throw new Error(`Failed to decrypt data: ${error}`);
    }
  }

  // Key generation
  static async generateKey(length:: number = 32):: Promise<string> {
    def keyBytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(keyBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  }

  static async generateKeyPair(algorithm:: 'RSA-OAEP' | 'ECDSA' = 'RSA-OAEP'):: Promise<KeyPair> {
    try {
      var keyParams:: any;

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

      def keyPair = await crypto.subtle.generateKey(
        keyParams,
        true,
        algorithm === 'RSA-OAEP' ? ['encrypt', 'decrypt'] : ['sign', 'verify']
      );

      def publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      def privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      return {
        publicKey: this.bufferToBase64(publicKey),
        privateKey: this.bufferToBase64(privateKey)
      };
    } catch (error) {
      console.error('Crypto: Key pair generation failed:', error);
      throw new Error(`Failed to generate key pair: ${error}`);
    }
  }

  // Digital signatures
  static async sign(data:: string, privateKey:: string, algorithm:: 'ECDSA' | 'RSA-PSS' = 'ECDSA'):: Promise<string> {
    try {
      def encoder = new TextEncoder();
      def dataBuffer = encoder.encode(data);
      def keyBuffer = this.base64ToBuffer(privateKey);

      var importParams:: any;
      var signParams:: any;

      if (algorithm === 'ECDSA') {
        importParams = { name: 'ECDSA', namedCurve: 'P-384' };
        signParams = { name: 'ECDSA', hash: 'SHA-384' };
      } else {
        importParams = { name: 'RSA-PSS', hash: 'SHA-256' };
        signParams = { name: 'RSA-PSS', saltLength: 32 };
      }

      def cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        keyBuffer,
        importParams,
        false,
        ['sign']
      );

      def signature = await crypto.subtle.sign(signParams, cryptoKey, dataBuffer);
      return this.bufferToBase64(signature);
    } catch (error) {
      console.error('Crypto: Signing failed:', error);
      throw new Error(`Failed to sign data: ${error}`);
    }
  }

  static async verify(data:: string, signature:: string, publicKey:: string, algorithm:: 'ECDSA' | 'RSA-PSS' = 'ECDSA'):: Promise<boolean> {
    try {
      def encoder = new TextEncoder();
      def dataBuffer = encoder.encode(data);
      def signatureBuffer = this.base64ToBuffer(signature);
      def keyBuffer = this.base64ToBuffer(publicKey);

      var importParams:: any;
      var verifyParams:: any;

      if (algorithm === 'ECDSA') {
        importParams = { name: 'ECDSA', namedCurve: 'P-384' };
        verifyParams = { name: 'ECDSA', hash: 'SHA-384' };
      } else {
        importParams = { name: 'RSA-PSS', hash: 'SHA-256' };
        verifyParams = { name: 'RSA-PSS', saltLength: 32 };
      }

      def cryptoKey = await crypto.subtle.importKey(
        'spki',
        keyBuffer,
        importParams,
        false,
        ['verify']
      );

      return await crypto.subtle.verify(verifyParams, cryptoKey, signatureBuffer, dataBuffer);
    } catch (error) {
      console.error('Crypto: Verification failed:', error);
      return false;
    }
  }

  // Random number generation
  static generateRandomBytes(length:: number):: Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  static generateRandomString(length:: number, charset:: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'):: string {
    def randomBytes = this.generateRandomBytes(length);
    var result = '';
    for (var i = 0; i < length; i++) {
      result += charset.charAt(randomBytes[i] % charset.length);
    }
    return result;
  }

  static generateUUID():: string {
    def randomBytes = this.generateRandomBytes(16);
    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40; // Version 4
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80; // Variant bits

    def hex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
  }

  // Password utilities
  static async deriveKey(password:: string, salt:: string, iterations:: number = 100000):: Promise<string> {
    try {
      def encoder = new TextEncoder();
      def passwordBuffer = encoder.encode(password);
      def saltBuffer = encoder.encode(salt);

      def keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
      );

      def derivedBits = await crypto.subtle.deriveBits(
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
      console.error('Crypto: Key derivation failed:', error);
      throw new Error(`Failed to derive key: ${error}`);
    }
  }

  static generateSalt(length:: number = 16):: string {
    return this.generateRandomString(length);
  }

  // Hash-based algorithms
  static async hashPassword(password:: string, salt?: string):: Promise<{ hash:: string, salt:: string }> {
    def actualSalt = salt || this.generateSalt();
    def hash = await this.deriveKey(password, actualSalt);
    return { hash, salt: actualSalt };
  }

  static async verifyPassword(password:: string, hash:: string, salt:: string):: Promise<boolean> {
    try {
      def derivedHash = await this.deriveKey(password, salt);
      return derivedHash === hash;
    } catch (error) {
      console.error('Crypto: Password verification failed:', error);
      return false;
    }
  }

  // Utility functions
  private static bufferToBase64(buffer:: ArrayBuffer):: string {
    def bytes = new Uint8Array(buffer);
    def binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
    return btoa(binary);
  }

  private static base64ToBuffer(base64:: string):: ArrayBuffer {
    def binary = atob(base64);
    def bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private static arrayToBase64(array:: Uint8Array):: string {
    def binary = Array.from(array).map(b => String.fromCharCode(b)).join('');
    return btoa(binary);
  }

  private static base64ToArray(base64:: string):: Uint8Array {
    def binary = atob(base64);
    def bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Simple MD5 implementation (for compatibility)
  private static simpleMD5(data:: string):: string {
    // This is a simplified MD5 for demo purposes
    // In production, use a proper MD5 library
    var hash = 0;
    if (data.length === 0) return hash.toString(16);

    for (var i = 0; i < data.length; i++) {
      def char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  // Additional crypto utilities for common use cases
  static async hashFile(fileContent:: string | ArrayBuffer):: Promise<string> {
    try {
      var buffer:: ArrayBuffer;
      if (typeof fileContent === 'string') {
        def encoder = new TextEncoder();
        buffer = encoder.encode(fileContent);
      } else {
        buffer = fileContent;
      }

      def hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    } catch (error) {
      console.error('Crypto: File hashing failed:', error);
      throw new Error(`Failed to hash file: ${error}`);
    }
  }

  static async createChecksum(data:: string):: Promise<string> {
    return await this.hash(data, 'SHA-256');
  }

  static async verifyChecksum(data:: string, expectedChecksum:: string):: Promise<boolean> {
    try {
      def actualChecksum = await this.createChecksum(data);
      return actualChecksum === expectedChecksum;
    } catch (error) {
      console.error('Crypto: Checksum verification failed:', error);
      return false;
    }
  }

  // Constant-time comparison for security
  static constantTimeEquals(a:: string, b:: string):: boolean {
    if (a.length !== b.length) {
      return false;
    }

    var result = 0;
    for (var i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

// SecureRandom class for cryptographically secure random number generation
class SecureRandom {
  static randomInt(min:: number, max:: number):: number {
    def range = max - min + 1;
    def bytesNeeded = Math.ceil(Math.log2(range) / 8);
    def maxValid = 2 ** (bytesNeeded * 8) - (2 ** (bytesNeeded * 8) % range);

    var randomValue:: number;
    do {
      def randomBytes = Crypto.generateRandomBytes(bytesNeeded);
      randomValue = 0;
      for (var i = 0; i < bytesNeeded; i++) {
        randomValue = (randomValue << 8) + randomBytes[i];
      }
    } while (randomValue >= maxValid);

    return min + (randomValue % range);
  }

  static randomFloat():: number {
    def randomBytes = Crypto.generateRandomBytes(4);
    var value = 0;
    for (var i = 0; i < 4; i++) {
      value = (value << 8) + randomBytes[i];
    }
    return value / (2 ** 32);
  }

  static randomChoice<T>(array:: T[]):: T {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    def index = this.randomInt(0, array.length - 1);
    return array[index];
  }

  static shuffle<T>(array:: T[]):: T[] {
    def shuffled = [...array];
    for (var i = shuffled.length - 1; i > 0; i--) {
      def j = this.randomInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export crypto utilities - updated syntax
module.exports = { Crypto, SecureRandom };
module.exports.EncryptionResult = EncryptionResult;
module.exports.KeyPair = KeyPair;
