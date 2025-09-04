import { debug } from '../debug';

export interface JsonOptions {
  space?: string | number;
  replacer?: (key: string, value: any) => any;
  reviver?: (key: string, value: any) => any;
}

export class Json {
  /**
   * Parse JSON string with enhanced error handling
   */
  static parse<T = any>(text: string, options?: JsonOptions): T {
    try {
      return JSON.parse(text, options?.reviver);
    } catch (error) {
      debug.error('Json', `Failed to parse JSON: ${error}`);
      throw new Error(`Invalid JSON: ${error}`);
    }
  }

  /**
   * Safely parse JSON with default value on error
   */
  static safeParse<T = any>(text: string, defaultValue: T, options?: JsonOptions): T {
    try {
      return JSON.parse(text, options?.reviver);
    } catch (error) {
      debug.warn('Json', `Failed to parse JSON, returning default: ${error}`);
      return defaultValue;
    }
  }

  /**
   * Stringify object to JSON with enhanced options
   */
  static stringify(value: any, options?: JsonOptions): string {
    try {
      return JSON.stringify(value, options?.replacer, options?.space);
    } catch (error) {
      debug.error('Json', `Failed to stringify object: ${error}`);
      throw new Error(`Serialization failed: ${error}`);
    }
  }

  /**
   * Pretty print JSON with indentation
   */
  static prettyPrint(value: any, indentSize: number = 2): string {
    return this.stringify(value, { space: indentSize });
  }

  /**
   * Check if string is valid JSON
   */
  static isValid(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deep clone object using JSON serialization
   */
  static clone<T>(obj: T): T {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      debug.error('Json', `Failed to clone object: ${error}`);
      throw new Error(`Clone failed: ${error}`);
    }
  }

  /**
   * Merge two JSON objects
   */
  static merge(target: any, source: any): any {
    const merged = this.clone(target);
    return Object.assign(merged, source);
  }

  /**
   * Deep merge two JSON objects recursively
   */
  static deepMerge(target: any, source: any): any {
    const result = this.clone(target);
    
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
            result[key] = this.deepMerge(result[key], source[key]);
          } else {
            result[key] = this.clone(source[key]);
          }
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  /**
   * Extract value at JSON path (simple dot notation)
   */
  static getPath(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  /**
   * Set value at JSON path (simple dot notation)
   */
  static setPath(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    if (lastKey) {
      current[lastKey] = value;
    }
    
    return obj;
  }

  /**
   * Remove value at JSON path
   */
  static removePath(obj: any, path: string): any {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current)) {
        return obj; // Path doesn't exist
      }
      current = current[key];
    }
    
    if (lastKey && current && typeof current === 'object') {
      delete current[lastKey];
    }
    
    return obj;
  }

  /**
   * Flatten nested JSON object
   */
  static flatten(obj: any, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flatten(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }

  /**
   * Unflatten flattened JSON object
   */
  static unflatten(obj: Record<string, any>): any {
    const result = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        this.setPath(result, key, obj[key]);
      }
    }
    
    return result;
  }

  /**
   * Get all keys from nested JSON object
   */
  static getAllKeys(obj: any, prefix: string = ''): string[] {
    const keys: string[] = [];
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        keys.push(newKey);
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          keys.push(...this.getAllKeys(obj[key], newKey));
        }
      }
    }
    
    return keys;
  }

  /**
   * Compare two JSON objects for deep equality
   */
  static equals(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}