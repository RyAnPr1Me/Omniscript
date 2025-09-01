/**
 * Advanced serialization library for Omniscript
 * Supports JSON, XML, Protocol Buffers, MessagePack, and more
 */

import { logger } from './logging';
import { Validator } from './validation';

export interface SerializationOptions {
  format?: 'json' | 'xml' | 'yaml' | 'msgpack' | 'protobuf';
  pretty?: boolean;
  strict?: boolean;
  schema?: any;
  encoding?: 'utf8' | 'base64' | 'hex';
}

export interface SerializationResult<T = any> {
  data: string | Uint8Array;
  format: string;
  size: number;
  metadata?: Record<string, any>;
}

export interface DeserializationResult<T = any> {
  data: T;
  format: string;
  isValid: boolean;
  errors?: string[];
}

// Base serializer interface
export abstract class BaseSerializer {
  abstract serialize(data: any, options?: SerializationOptions): SerializationResult;
  abstract deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T>;
  abstract getContentType(): string;
  abstract getFileExtension(): string;
}

// JSON Serializer with enhanced features
export class JsonSerializer extends BaseSerializer {
  private static readonly CONTENT_TYPE = 'application/json';
  private static readonly EXTENSION = '.json';

  serialize(data: any, options?: SerializationOptions): SerializationResult {
    try {
      const pretty = options?.pretty ?? false;
      const replacer = this.createReplacer();
      
      const jsonString = JSON.stringify(data, replacer, pretty ? 2 : undefined);
      
      return {
        data: jsonString,
        format: 'json',
        size: new TextEncoder().encode(jsonString).length,
        metadata: {
          pretty,
          compressed: false
        }
      };
    } catch (error) {
      logger.error('JSON serialization failed', error as Error);
      throw new Error(`JSON serialization failed: ${(error as Error).message}`);
    }
  }

  deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T> {
    try {
      const jsonString = typeof serialized === 'string' ? serialized : new TextDecoder().decode(serialized);
      const reviver = this.createReviver();
      
      const data = JSON.parse(jsonString, reviver);
      
      // Validate against schema if provided
      if (options?.schema) {
        const validation = options.schema(data);
        if (!validation.isValid) {
          return {
            data,
            format: 'json',
            isValid: false,
            errors: validation.errors.map((e: any) => e.message)
          };
        }
      }
      
      return {
        data,
        format: 'json',
        isValid: true
      };
    } catch (error) {
      logger.error('JSON deserialization failed', error as Error);
      return {
        data: null as T,
        format: 'json',
        isValid: false,
        errors: [(error as Error).message]
      };
    }
  }

  getContentType(): string {
    return JsonSerializer.CONTENT_TYPE;
  }

  getFileExtension(): string {
    return JsonSerializer.EXTENSION;
  }

  private createReplacer(): (key: string, value: any) => any {
    const seen = new WeakSet();
    
    return (key: string, value: any) => {
      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      
      // Handle special types
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      
      if (value instanceof RegExp) {
        return { __type: 'RegExp', value: value.toString() };
      }
      
      if (value instanceof Map) {
        return { __type: 'Map', value: Array.from(value.entries()) };
      }
      
      if (value instanceof Set) {
        return { __type: 'Set', value: Array.from(value) };
      }
      
      // Handle BigInt
      if (typeof value === 'bigint') {
        return { __type: 'BigInt', value: value.toString() };
      }
      
      // Handle functions (serialize as string)
      if (typeof value === 'function') {
        return { __type: 'Function', value: value.toString() };
      }
      
      return value;
    };
  }

  private createReviver(): (key: string, value: any) => any {
    return (key: string, value: any) => {
      if (typeof value === 'object' && value !== null && value.__type) {
        switch (value.__type) {
          case 'Date':
            return new Date(value.value);
          case 'RegExp':
            const match = value.value.match(/^\/(.*)\/([gimuy]*)$/);
            return match ? new RegExp(match[1], match[2]) : new RegExp(value.value);
          case 'Map':
            return new Map(value.value);
          case 'Set':
            return new Set(value.value);
          case 'BigInt':
            return BigInt(value.value);
          case 'Function':
            // Note: Deserializing functions is potentially unsafe
            try {
              return new Function(`return ${value.value}`)();
            } catch {
              return null;
            }
          default:
            return value;
        }
      }
      return value;
    };
  }
}

// XML Serializer
export class XmlSerializer extends BaseSerializer {
  private static readonly CONTENT_TYPE = 'application/xml';
  private static readonly EXTENSION = '.xml';

  serialize(data: any, options?: SerializationOptions): SerializationResult {
    try {
      const pretty = options?.pretty ?? false;
      const xmlString = this.objectToXml(data, { pretty });
      
      return {
        data: xmlString,
        format: 'xml',
        size: new TextEncoder().encode(xmlString).length,
        metadata: {
          pretty,
          encoding: 'utf-8'
        }
      };
    } catch (error) {
      logger.error('XML serialization failed', error as Error);
      throw new Error(`XML serialization failed: ${(error as Error).message}`);
    }
  }

  deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T> {
    try {
      const xmlString = typeof serialized === 'string' ? serialized : new TextDecoder().decode(serialized);
      const data = this.xmlToObject(xmlString);
      
      return {
        data,
        format: 'xml',
        isValid: true
      };
    } catch (error) {
      logger.error('XML deserialization failed', error as Error);
      return {
        data: null as T,
        format: 'xml',
        isValid: false,
        errors: [(error as Error).message]
      };
    }
  }

  getContentType(): string {
    return XmlSerializer.CONTENT_TYPE;
  }

  getFileExtension(): string {
    return XmlSerializer.EXTENSION;
  }

  private objectToXml(obj: any, options: { pretty?: boolean; indent?: number } = {}): string {
    const { pretty = false, indent = 0 } = options;
    const spaces = pretty ? '  '.repeat(indent) : '';
    const newline = pretty ? '\n' : '';
    
    if (obj === null || obj === undefined) {
      return `${spaces}<null/>${newline}`;
    }
    
    if (typeof obj === 'string') {
      return `${spaces}<string>${this.escapeXml(obj)}</string>${newline}`;
    }
    
    if (typeof obj === 'number') {
      return `${spaces}<number>${obj}</number>${newline}`;
    }
    
    if (typeof obj === 'boolean') {
      return `${spaces}<boolean>${obj}</boolean>${newline}`;
    }
    
    if (Array.isArray(obj)) {
      const items = obj.map(item => 
        this.objectToXml(item, { pretty, indent: indent + 1 })
      ).join('');
      return `${spaces}<array>${newline}${items}${spaces}</array>${newline}`;
    }
    
    if (typeof obj === 'object') {
      const entries = Object.entries(obj).map(([key, value]) => {
        const validKey = this.sanitizeXmlTag(key);
        const content = this.objectToXml(value, { pretty, indent: indent + 1 });
        return `${spaces}<${validKey}>${newline}${content}${spaces}</${validKey}>${newline}`;
      }).join('');
      
      return indent === 0 ? `<?xml version="1.0" encoding="UTF-8"?>${newline}<root>${newline}${entries}</root>${newline}` : entries;
    }
    
    return `${spaces}<unknown>${String(obj)}</unknown>${newline}`;
  }

  private xmlToObject(xmlString: string): any {
    // Simple XML parser (in production, you'd want a more robust parser)
    const cleanXml = xmlString.replace(/<?xml[^>]*>/, '').trim();
    
    // Remove root element if present
    const rootMatch = cleanXml.match(/^<root>(.*)<\/root>$/s);
    const content = rootMatch ? rootMatch[1] : cleanXml;
    
    return this.parseXmlContent(content);
  }

  private parseXmlContent(content: string): any {
    content = content.trim();
    
    // Handle self-closing tags
    if (content === '<null/>') return null;
    
    // Handle simple value tags
    const simpleTagMatch = content.match(/^<(\w+)>(.*)<\/\1>$/s);
    if (simpleTagMatch) {
      const [, tagName, value] = simpleTagMatch;
      
      switch (tagName) {
        case 'string':
          return this.unescapeXml(value);
        case 'number':
          return Number(value);
        case 'boolean':
          return value === 'true';
        case 'null':
          return null;
        case 'array':
          return this.parseXmlArray(value);
        default:
          // It's an object property
          return { [tagName]: this.parseXmlContent(value) };
      }
    }
    
    // Handle multiple elements (object)
    const elements = this.extractElements(content);
    const result: any = {};
    
    for (const element of elements) {
      const elementObj = this.parseXmlContent(element);
      Object.assign(result, elementObj);
    }
    
    return result;
  }

  private parseXmlArray(content: string): any[] {
    const elements = this.extractElements(content);
    return elements.map(element => this.parseXmlContent(element));
  }

  private extractElements(content: string): string[] {
    const elements: string[] = [];
    let depth = 0;
    let start = 0;
    let i = 0;
    
    while (i < content.length) {
      if (content[i] === '<') {
        if (content[i + 1] === '/') {
          depth--;
          if (depth === 0) {
            const tagEnd = content.indexOf('>', i);
            elements.push(content.substring(start, tagEnd + 1));
            start = tagEnd + 1;
            i = tagEnd + 1;
            continue;
          }
        } else if (content.substring(i, i + 4) !== '<!--') {
          if (depth === 0) {
            start = i;
          }
          depth++;
        }
      }
      i++;
    }
    
    return elements.filter(el => el.trim().length > 0);
  }

  private sanitizeXmlTag(tag: string): string {
    return tag.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private unescapeXml(text: string): string {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');
  }
}

// YAML Serializer (simplified implementation)
export class YamlSerializer extends BaseSerializer {
  private static readonly CONTENT_TYPE = 'application/x-yaml';
  private static readonly EXTENSION = '.yaml';

  serialize(data: any, options?: SerializationOptions): SerializationResult {
    try {
      const yamlString = this.objectToYaml(data, 0);
      
      return {
        data: yamlString,
        format: 'yaml',
        size: new TextEncoder().encode(yamlString).length,
        metadata: {
          indented: true
        }
      };
    } catch (error) {
      logger.error('YAML serialization failed', error as Error);
      throw new Error(`YAML serialization failed: ${(error as Error).message}`);
    }
  }

  deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T> {
    try {
      const yamlString = typeof serialized === 'string' ? serialized : new TextDecoder().decode(serialized);
      const data = this.yamlToObject(yamlString);
      
      return {
        data,
        format: 'yaml',
        isValid: true
      };
    } catch (error) {
      logger.error('YAML deserialization failed', error as Error);
      return {
        data: null as T,
        format: 'yaml',
        isValid: false,
        errors: [(error as Error).message]
      };
    }
  }

  getContentType(): string {
    return YamlSerializer.CONTENT_TYPE;
  }

  getFileExtension(): string {
    return YamlSerializer.EXTENSION;
  }

  private objectToYaml(obj: any, depth: number): string {
    const indent = '  '.repeat(depth);
    
    if (obj === null || obj === undefined) {
      return 'null';
    }
    
    if (typeof obj === 'string') {
      // Simple quoting logic
      if (obj.includes('\n') || obj.includes('"') || obj.includes("'")) {
        return `"${obj.replace(/"/g, '\\"')}"`;
      }
      return obj;
    }
    
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj);
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      
      return obj.map(item => {
        const yamlValue = this.objectToYaml(item, depth + 1);
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          return `${indent}- ${yamlValue.split('\n').join('\n' + indent + '  ')}`;
        }
        return `${indent}- ${yamlValue}`;
      }).join('\n');
    }
    
    if (typeof obj === 'object') {
      if (Object.keys(obj).length === 0) return '{}';
      
      return Object.entries(obj).map(([key, value]) => {
        const yamlValue = this.objectToYaml(value, depth + 1);
        if (typeof value === 'object' && value !== null) {
          return `${indent}${key}:\n${yamlValue}`;
        }
        return `${indent}${key}: ${yamlValue}`;
      }).join('\n');
    }
    
    return String(obj);
  }

  private yamlToObject(yamlString: string): any {
    // Simplified YAML parser
    const lines = yamlString.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    return this.parseYamlLines(lines, 0).value;
  }

  private parseYamlLines(lines: string[], startIndex: number): { value: any; nextIndex: number } {
    if (startIndex >= lines.length) {
      return { value: null, nextIndex: startIndex };
    }
    
    const firstLine = lines[startIndex];
    const baseIndent = firstLine.length - firstLine.trimStart().length;
    
    // Check if it's an array
    if (firstLine.trim().startsWith('-')) {
      const array: any[] = [];
      let index = startIndex;
      
      while (index < lines.length) {
        const line = lines[index];
        const indent = line.length - line.trimStart().length;
        
        if (indent < baseIndent || !line.trim().startsWith('-')) {
          break;
        }
        
        if (indent === baseIndent) {
          const value = line.trim().substring(1).trim();
          if (value) {
            array.push(this.parseYamlValue(value));
          } else {
            // Multi-line array item
            const result = this.parseYamlLines(lines, index + 1);
            array.push(result.value);
            index = result.nextIndex - 1;
          }
        }
        
        index++;
      }
      
      return { value: array, nextIndex: index };
    }
    
    // It's an object
    const obj: any = {};
    let index = startIndex;
    
    while (index < lines.length) {
      const line = lines[index];
      const indent = line.length - line.trimStart().length;
      
      if (indent < baseIndent) {
        break;
      }
      
      if (indent === baseIndent && line.includes(':')) {
        const colonIndex = line.indexOf(':');
        const key = line.substring(indent, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        
        if (value) {
          obj[key] = this.parseYamlValue(value);
        } else {
          // Multi-line value
          const result = this.parseYamlLines(lines, index + 1);
          obj[key] = result.value;
          index = result.nextIndex - 1;
        }
      }
      
      index++;
    }
    
    return { value: obj, nextIndex: index };
  }

  private parseYamlValue(value: string): any {
    const trimmed = value.trim();
    
    if (trimmed === 'null' || trimmed === '~') return null;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    
    const num = Number(trimmed);
    if (!isNaN(num) && isFinite(num)) return num;
    
    // Remove quotes if present
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    
    return trimmed;
  }
}

// Binary serializer for MessagePack-like format
export class BinarySerializer extends BaseSerializer {
  private static readonly CONTENT_TYPE = 'application/octet-stream';
  private static readonly EXTENSION = '.bin';

  serialize(data: any, options?: SerializationOptions): SerializationResult {
    try {
      const buffer = this.serializeToBinary(data);
      
      return {
        data: buffer,
        format: 'binary',
        size: buffer.length,
        metadata: {
          compressed: false,
          encoding: 'binary'
        }
      };
    } catch (error) {
      logger.error('Binary serialization failed', error as Error);
      throw new Error(`Binary serialization failed: ${(error as Error).message}`);
    }
  }

  deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T> {
    try {
      const buffer = serialized instanceof Uint8Array ? serialized : new TextEncoder().encode(serialized);
      const data = this.deserializeFromBinary(buffer);
      
      return {
        data,
        format: 'binary',
        isValid: true
      };
    } catch (error) {
      logger.error('Binary deserialization failed', error as Error);
      return {
        data: null as T,
        format: 'binary',
        isValid: false,
        errors: [(error as Error).message]
      };
    }
  }

  getContentType(): string {
    return BinarySerializer.CONTENT_TYPE;
  }

  getFileExtension(): string {
    return BinarySerializer.EXTENSION;
  }

  private serializeToBinary(data: any): Uint8Array {
    const chunks: number[] = [];
    this.writeValue(data, chunks);
    return new Uint8Array(chunks);
  }

  private writeValue(value: any, chunks: number[]): void {
    if (value === null) {
      chunks.push(0x00); // null
    } else if (typeof value === 'boolean') {
      chunks.push(value ? 0x01 : 0x02); // true/false
    } else if (typeof value === 'number') {
      if (Number.isInteger(value) && value >= -128 && value <= 127) {
        chunks.push(0x10); // int8
        chunks.push(value & 0xFF);
      } else if (Number.isInteger(value) && value >= -32768 && value <= 32767) {
        chunks.push(0x11); // int16
        const buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, value, true);
        chunks.push(...new Uint8Array(buffer));
      } else {
        chunks.push(0x12); // float64
        const buffer = new ArrayBuffer(8);
        new DataView(buffer).setFloat64(0, value, true);
        chunks.push(...new Uint8Array(buffer));
      }
    } else if (typeof value === 'string') {
      const encoded = new TextEncoder().encode(value);
      chunks.push(0x20); // string
      this.writeLength(encoded.length, chunks);
      chunks.push(...encoded);
    } else if (Array.isArray(value)) {
      chunks.push(0x30); // array
      this.writeLength(value.length, chunks);
      for (const item of value) {
        this.writeValue(item, chunks);
      }
    } else if (typeof value === 'object') {
      chunks.push(0x40); // object
      const entries = Object.entries(value);
      this.writeLength(entries.length, chunks);
      for (const [key, val] of entries) {
        this.writeValue(key, chunks);
        this.writeValue(val, chunks);
      }
    } else {
      // Fallback: serialize as string
      this.writeValue(String(value), chunks);
    }
  }

  private writeLength(length: number, chunks: number[]): void {
    if (length < 256) {
      chunks.push(length);
    } else if (length < 65536) {
      chunks.push(0xFF);
      const buffer = new ArrayBuffer(2);
      new DataView(buffer).setUint16(0, length, true);
      chunks.push(...new Uint8Array(buffer));
    } else {
      chunks.push(0xFE);
      const buffer = new ArrayBuffer(4);
      new DataView(buffer).setUint32(0, length, true);
      chunks.push(...new Uint8Array(buffer));
    }
  }

  private deserializeFromBinary(buffer: Uint8Array): any {
    const context = { offset: 0 };
    return this.readValue(buffer, context);
  }

  private readValue(buffer: Uint8Array, context: { offset: number }): any {
    if (context.offset >= buffer.length) {
      throw new Error('Unexpected end of buffer');
    }
    
    const type = buffer[context.offset++];
    
    switch (type) {
      case 0x00: // null
        return null;
      case 0x01: // true
        return true;
      case 0x02: // false
        return false;
      case 0x10: // int8
        return new DataView(buffer.buffer, context.offset++, 1).getInt8(0);
      case 0x11: // int16
        const int16 = new DataView(buffer.buffer, context.offset, 2).getInt16(0, true);
        context.offset += 2;
        return int16;
      case 0x12: // float64
        const float64 = new DataView(buffer.buffer, context.offset, 8).getFloat64(0, true);
        context.offset += 8;
        return float64;
      case 0x20: // string
        const strLength = this.readLength(buffer, context);
        const strBytes = buffer.slice(context.offset, context.offset + strLength);
        context.offset += strLength;
        return new TextDecoder().decode(strBytes);
      case 0x30: // array
        const arrLength = this.readLength(buffer, context);
        const array = [];
        for (let i = 0; i < arrLength; i++) {
          array.push(this.readValue(buffer, context));
        }
        return array;
      case 0x40: // object
        const objLength = this.readLength(buffer, context);
        const object: any = {};
        for (let i = 0; i < objLength; i++) {
          const key = this.readValue(buffer, context);
          const value = this.readValue(buffer, context);
          object[key] = value;
        }
        return object;
      default:
        throw new Error(`Unknown type marker: 0x${type.toString(16)}`);
    }
  }

  private readLength(buffer: Uint8Array, context: { offset: number }): number {
    const first = buffer[context.offset++];
    
    if (first === 0xFF) {
      const length = new DataView(buffer.buffer, context.offset, 2).getUint16(0, true);
      context.offset += 2;
      return length;
    } else if (first === 0xFE) {
      const length = new DataView(buffer.buffer, context.offset, 4).getUint32(0, true);
      context.offset += 4;
      return length;
    } else {
      return first;
    }
  }
}

// Serialization factory and utilities
export class Serialization {
  private static serializers = new Map<string, BaseSerializer>([
    ['json', new JsonSerializer()],
    ['xml', new XmlSerializer()],
    ['yaml', new YamlSerializer()],
    ['binary', new BinarySerializer()]
  ]);

  static serialize(data: any, format: string = 'json', options?: SerializationOptions): SerializationResult {
    const serializer = this.serializers.get(format);
    if (!serializer) {
      throw new Error(`Unsupported serialization format: ${format}`);
    }

    return serializer.serialize(data, { ...options, format: format as any });
  }

  static deserialize<T = any>(
    serialized: string | Uint8Array, 
    format: string = 'json', 
    options?: SerializationOptions
  ): DeserializationResult<T> {
    const serializer = this.serializers.get(format);
    if (!serializer) {
      throw new Error(`Unsupported deserialization format: ${format}`);
    }

    return serializer.deserialize<T>(serialized, { ...options, format: format as any });
  }

  static registerSerializer(format: string, serializer: BaseSerializer): void {
    this.serializers.set(format, serializer);
    logger.info('Serialization', { format });
  }

  static getAvailableFormats(): string[] {
    return Array.from(this.serializers.keys());
  }

  static getContentType(format: string): string {
    const serializer = this.serializers.get(format);
    return serializer?.getContentType() || 'application/octet-stream';
  }

  static getFileExtension(format: string): string {
    const serializer = this.serializers.get(format);
    return serializer?.getFileExtension() || '.dat';
  }

  // Utility methods
  static clone<T>(obj: T, format: string = 'json'): T {
    const serialized = this.serialize(obj, format);
    const deserialized = this.deserialize<T>(serialized.data, format);
    return deserialized.data;
  }

  static compare(obj1: any, obj2: any, format: string = 'json'): boolean {
    try {
      const serialized1 = this.serialize(obj1, format);
      const serialized2 = this.serialize(obj2, format);
      
      if (typeof serialized1.data === 'string' && typeof serialized2.data === 'string') {
        return serialized1.data === serialized2.data;
      }
      
      if (serialized1.data instanceof Uint8Array && serialized2.data instanceof Uint8Array) {
        return serialized1.data.length === serialized2.data.length &&
               serialized1.data.every((byte, index) => byte === serialized2.data[index]);
      }
      
      return false;
    } catch {
      return false;
    }
  }

  static compress(data: string | Uint8Array, algorithm: 'gzip' | 'deflate' = 'gzip'): Uint8Array {
    // Simple compression simulation (in production, use actual compression libraries)
    const input = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    
    // Placeholder for actual compression
    logger.debug('Serialization', { size: input.length, algorithm });
    
    // Return original data for now (would implement actual compression)
    return input;
  }

  static decompress(data: Uint8Array, algorithm: 'gzip' | 'deflate' = 'gzip'): Uint8Array {
    // Simple decompression simulation
    logger.debug('Serialization', { size: data.length, algorithm });
    
    // Return original data for now (would implement actual decompression)
    return data;
  }
}

// Common serialization helpers
export const Serialize = {
  toJson: (data: any, pretty = false) => Serialization.serialize(data, 'json', { pretty, format: 'json' }),
  fromJson: <T = any>(json: string) => Serialization.deserialize<T>(json, 'json'),
  
  toXml: (data: any, pretty = false) => Serialization.serialize(data, 'xml', { pretty, format: 'xml' }),
  fromXml: <T = any>(xml: string) => Serialization.deserialize<T>(xml, 'xml'),
  
  toYaml: (data: any) => Serialization.serialize(data, 'yaml'),
  fromYaml: <T = any>(yaml: string) => Serialization.deserialize<T>(yaml, 'yaml'),
  
  toBinary: (data: any) => Serialization.serialize(data, 'binary'),
  fromBinary: <T = any>(binary: Uint8Array) => Serialization.deserialize<T>(binary, 'binary'),
  
  clone: <T>(obj: T) => Serialization.clone(obj),
  compare: (obj1: any, obj2: any) => Serialization.compare(obj1, obj2)
};

// Only log initialization in non-CLI contexts
if (!process.argv.some(arg => arg.includes('cli.js') || arg.includes('bin/cli'))) {
  logger.info('Serialization library initialized');
}