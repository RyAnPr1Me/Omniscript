import { debug } from '../debug';

export class Encoding {
  /**
   * Encode string to Base64
   */
  static toBase64(input: string): string {
    try {
      if (typeof btoa !== 'undefined') {
        // For Unicode strings, first encode to UTF-8 bytes
        const utf8Bytes = new TextEncoder().encode(input);
        let binary = '';
        for (let i = 0; i < utf8Bytes.length; i++) {
          binary += String.fromCharCode(utf8Bytes[i]);
        }
        return btoa(binary);
      } else if (typeof Buffer !== 'undefined') {
        return Buffer.from(input, 'utf8').toString('base64');
      } else {
        return this.base64Encode(input);
      }
    } catch (error) {
      debug.error('Encoding', `Base64 encoding failed: ${error}`);
      throw new Error(`Base64 encoding failed: ${error}`);
    }
  }

  /**
   * Decode Base64 to string
   */
  static fromBase64(input: string): string {
    try {
      if (typeof atob !== 'undefined') {
        const binary = atob(input);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
      } else if (typeof Buffer !== 'undefined') {
        return Buffer.from(input, 'base64').toString('utf8');
      } else {
        return this.base64Decode(input);
      }
    } catch (error) {
      debug.error('Encoding', `Base64 decoding failed: ${error}`);
      throw new Error(`Base64 decoding failed: ${error}`);
    }
  }

  /**
   * URL encode (percent encoding)
   */
  static urlEncode(input: string): string {
    try {
      return encodeURIComponent(input);
    } catch (error) {
      debug.error('Encoding', `URL encoding failed: ${error}`);
      throw new Error(`URL encoding failed: ${error}`);
    }
  }

  /**
   * URL decode
   */
  static urlDecode(input: string): string {
    try {
      return decodeURIComponent(input);
    } catch (error) {
      debug.error('Encoding', `URL decoding failed: ${error}`);
      throw new Error(`URL decoding failed: ${error}`);
    }
  }

  /**
   * HTML encode (escape HTML entities)
   */
  static htmlEncode(input: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };

    return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
  }

  /**
   * HTML decode (unescape HTML entities)
   */
  static htmlDecode(input: string): string {
    const htmlEntities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#x2F;': '/'
    };

    return input.replace(/&(amp|lt|gt|quot|#39|#x2F);/g, (entity) => htmlEntities[entity] || entity);
  }

  /**
   * Hex encode
   */
  static toHex(input: string): string {
    let result = '';
    for (let i = 0; i < input.length; i++) {
      const hex = input.charCodeAt(i).toString(16);
      result += hex.padStart(2, '0');
    }
    return result;
  }

  /**
   * Hex decode
   */
  static fromHex(input: string): string {
    try {
      if (input.length % 2 !== 0) {
        throw new Error('Invalid hex string length');
      }
      
      let result = '';
      for (let i = 0; i < input.length; i += 2) {
        const hex = input.substr(i, 2);
        if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
          throw new Error('Invalid hex characters');
        }
        result += String.fromCharCode(parseInt(hex, 16));
      }
      return result;
    } catch (error) {
      debug.error('Encoding', `Hex decoding failed: ${error}`);
      throw new Error(`Hex decoding failed: ${error}`);
    }
  }

  /**
   * Binary encode (string to binary representation)
   */
  static toBinary(input: string): string {
    return input.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  }

  /**
   * Binary decode (binary representation to string)
   */
  static fromBinary(input: string): string {
    try {
      if (!/^[01]*$/.test(input)) {
        throw new Error('Invalid binary string');
      }
      
      const chunks = input.match(/.{1,8}/g) || [];
      return chunks.map(chunk => {
        if (chunk.length !== 8) {
          throw new Error('Invalid binary chunk length');
        }
        return String.fromCharCode(parseInt(chunk, 2));
      }).join('');
    } catch (error) {
      debug.error('Encoding', `Binary decoding failed: ${error}`);
      throw new Error(`Binary decoding failed: ${error}`);
    }
  }

  /**
   * Unicode escape encoding
   */
  static toUnicodeEscape(input: string): string {
    return input.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code > 127) {
        return '\\u' + code.toString(16).padStart(4, '0');
      }
      return char;
    }).join('');
  }

  /**
   * Unicode escape decoding
   */
  static fromUnicodeEscape(input: string): string {
    return input.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }

  /**
   * ROT13 encoding/decoding
   */
  static rot13(input: string): string {
    return input.replace(/[a-zA-Z]/g, (char) => {
      const start = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
    });
  }

  /**
   * Caesar cipher encoding
   */
  static caesarEncode(input: string, shift: number): string {
    return input.replace(/[a-zA-Z]/g, (char) => {
      const start = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - start + shift) % 26 + 26) % 26 + start);
    });
  }

  /**
   * Caesar cipher decoding
   */
  static caesarDecode(input: string, shift: number): string {
    return this.caesarEncode(input, -shift);
  }

  /**
   * Check if string is valid Base64
   */
  static isValidBase64(input: string): boolean {
    try {
      return /^[A-Za-z0-9+/]*={0,2}$/.test(input) && 
             this.fromBase64(input) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Check if string is valid hex
   */
  static isValidHex(input: string): boolean {
    return /^[0-9a-fA-F]*$/.test(input) && input.length % 2 === 0;
  }

  /**
   * Check if string is valid URL encoding
   */
  static isValidUrlEncoded(input: string): boolean {
    try {
      return this.urlDecode(input) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get encoding information about a string
   */
  static analyze(input: string): {
    length: number;
    byteLength: number;
    hasUnicode: boolean;
    hasSpecialChars: boolean;
    encoding: string[];
  } {
    const byteLength = new TextEncoder().encode(input).length;
    // eslint-disable-next-line no-control-regex
    const hasUnicode = /[^\u0000-\u007F]/.test(input);
    const hasSpecialChars = /[&<>"'/]/.test(input);
    
    const possibleEncodings: string[] = [];
    
    if (this.isValidBase64(input)) {
      possibleEncodings.push('base64');
    }
    
    if (this.isValidHex(input)) {
      possibleEncodings.push('hex');
    }
    
    if (this.isValidUrlEncoded(input)) {
      possibleEncodings.push('url-encoded');
    }
    
    return {
      length: input.length,
      byteLength,
      hasUnicode,
      hasSpecialChars,
      encoding: possibleEncodings
    };
  }

  // Private helper methods for environments without btoa/atob or Buffer

  private static base64Encode(input: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < input.length) {
      const a = input.charCodeAt(i++);
      const b = i < input.length ? input.charCodeAt(i++) : 0;
      const c = i < input.length ? input.charCodeAt(i++) : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < input.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < input.length ? chars.charAt(bitmap & 63) : '=';
    }
    
    return result;
  }

  private static base64Decode(input: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    input = input.replace(/[^A-Za-z0-9+/]/g, '');
    
    while (i < input.length) {
      const encoded1 = chars.indexOf(input.charAt(i++));
      const encoded2 = chars.indexOf(input.charAt(i++));
      const encoded3 = chars.indexOf(input.charAt(i++));
      const encoded4 = chars.indexOf(input.charAt(i++));
      
      const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
      
      result += String.fromCharCode((bitmap >> 16) & 255);
      if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
      if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
    }
    
    return result;
  }
}