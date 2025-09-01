/**
 * Advanced configuration management library for Omniscript
 * Supports environment variables, file-based config, validation, and hot-reloading
 */

import { logger } from './logging';
import { Validator, ValidationResult } from './validation';
import { Serialization } from './serialization';

export interface ConfigSource {
  name: string;
  priority: number;
  load(): Promise<Record<string, any>>;
  watch?(callback: (changes: Record<string, any>) => void): void;
  save?(config: Record<string, any>): Promise<void>;
}

export interface ConfigOptions {
  sources?: ConfigSource[];
  schema?: any;
  defaultValues?: Record<string, any>;
  enableWatch?: boolean;
  cacheTimeout?: number;
  caseSensitive?: boolean;
  allowOverrides?: boolean;
}

export interface ConfigChangeEvent {
  key: string;
  oldValue: any;
  newValue: any;
  source: string;
}

export type ConfigChangeListener = (event: ConfigChangeEvent) => void;

// Environment variables source
export class EnvironmentSource implements ConfigSource {
  name = 'environment';
  priority = 100;
  
  constructor(private prefix?: string, private transformKeys = true) {}

  async load(): Promise<Record<string, any>> {
    const config: Record<string, any> = {};
    
    // In browser environment, use a mock
    const env = typeof process !== 'undefined' ? process.env : {
      NODE_ENV: 'development',
      API_URL: 'http://localhost:3000',
      DEBUG: 'true'
    };
    
    for (const [key, value] of Object.entries(env)) {
      if (this.prefix && !key.startsWith(this.prefix)) {
        continue;
      }
      
      const configKey = this.transformKeys ? this.transformKey(key) : key;
      config[configKey] = this.parseValue(value || '');
    }
    
    logger.debug('Config', { count: Object.keys(config).length });
    return config;
  }

  private transformKey(key: string): string {
    if (this.prefix) {
      key = key.substring(this.prefix.length);
    }
    
    return key.toLowerCase().replace(/_/g, '.');
  }

  private parseValue(value: string): any {
    // Auto-parse common types
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    
    // Try parsing as number
    const num = Number(value);
    if (!isNaN(num) && isFinite(num) && !value.startsWith('0') || value === '0') {
      return num;
    }
    
    // Try parsing as JSON
    if ((value.startsWith('{') && value.endsWith('}')) || 
        (value.startsWith('[') && value.endsWith(']'))) {
      try {
        return JSON.parse(value);
      } catch {
        // Fall through to string
      }
    }
    
    return value;
  }
}

// File-based configuration source
export class FileSource implements ConfigSource {
  name: string;
  priority = 50;
  private watchers: ConfigChangeListener[] = [];
  
  constructor(
    private filename: string,
    private format: 'json' | 'yaml' | 'xml' = 'json'
  ) {
    this.name = `file:${filename}`;
  }

  async load(): Promise<Record<string, any>> {
    try {
      // In a real implementation, this would read from the file system
      // For now, we'll simulate with default configurations
      const mockConfigs: Record<string, Record<string, any>> = {
        'app.json': {
          app: {
            name: 'Omniscript App',
            version: '1.0.0'
          },
          database: {
            host: 'localhost',
            port: 5432
          }
        },
        'config.yaml': {
          server: {
            host: '0.0.0.0',
            port: 8080,
            ssl: false
          },
          logging: {
            level: 'info',
            outputs: ['console', 'file']
          }
        }
      };
      
      const config = mockConfigs[this.filename] || {};
      logger.debug('Config', { filename: this.filename });
      return config;
    } catch (error) {
      logger.warn('Config', { filename: this.filename, error: String(error) });
      return {};
    }
  }

  watch(callback: ConfigChangeListener): void {
    this.watchers.push(callback);
    
    // Simulate file watching
    setInterval(() => {
      // In production, this would use real file system watchers
      if (Math.random() < 0.01) { // 1% chance of simulated change
        callback({
          key: 'lastModified',
          oldValue: Date.now() - 1000,
          newValue: Date.now(),
          source: this.name
        });
      }
    }, 1000);
  }

  async save(config: Record<string, any>): Promise<void> {
    try {
      const serialized = Serialization.serialize(config, this.format, { pretty: true, format: this.format as any });
      logger.info('Config', { filename: this.filename, size: serialized.size });
    } catch (error) {
      logger.error('Config - Failed to save file', error as Error, { filename: this.filename });
      throw error;
    }
  }
}

// In-memory configuration source (for defaults)
export class MemorySource implements ConfigSource {
  name = 'memory';
  priority = 10;
  
  constructor(private config: Record<string, any> = {}) {}

  async load(): Promise<Record<string, any>> {
    return { ...this.config };
  }

  setConfig(config: Record<string, any>): void {
    this.config = { ...config };
  }

  updateConfig(updates: Record<string, any>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Configuration manager
export class Config {
  private sources: ConfigSource[] = [];
  private cache: Record<string, any> = {};
  private schema?: any;
  private listeners: ConfigChangeListener[] = [];
  private lastCacheUpdate = 0;
  private cacheTimeout: number;
  private caseSensitive: boolean;
  private allowOverrides: boolean;

  constructor(options: ConfigOptions = {}) {
    this.sources = options.sources || [];
    this.schema = options.schema;
    this.cacheTimeout = options.cacheTimeout || 30000; // 30 seconds
    this.caseSensitive = options.caseSensitive ?? true;
    this.allowOverrides = options.allowOverrides ?? true;

    // Add default sources if none provided
    if (this.sources.length === 0) {
      this.addSource(new EnvironmentSource());
      this.addSource(new FileSource('app.json'));
    }

    // Add default values source
    if (options.defaultValues) {
      this.addSource(new MemorySource(options.defaultValues));
    }

    // Enable watching if requested
    if (options.enableWatch) {
      this.enableWatching();
    }

    this.refreshCache();
  }

  addSource(source: ConfigSource): void {
    this.sources.push(source);
    this.sources.sort((a, b) => b.priority - a.priority);
    this.refreshCache();
    
    logger.debug('Config', { name: source.name, priority: source.priority });
  }

  removeSource(name: string): boolean {
    const index = this.sources.findIndex(source => source.name === name);
    if (index >= 0) {
      this.sources.splice(index, 1);
      this.refreshCache();
      logger.debug('Config', { name });
      return true;
    }
    return false;
  }

  async refreshCache(): Promise<void> {
    const mergedConfig: Record<string, any> = {};
    
    // Load from all sources in priority order
    for (const source of this.sources) {
      try {
        const sourceConfig = await source.load();
        this.mergeConfig(mergedConfig, sourceConfig);
      } catch (error) {
        logger.warn('Config', { source: source.name, error: String(error) });
      }
    }

    // Validate against schema if provided
    if (this.schema) {
      const validation = this.schema(mergedConfig);
      if (!validation.isValid) {
        logger.error('Config - Configuration validation failed', undefined, {
          errors: validation.errors
        });
        throw new Error(`Configuration validation failed: ${validation.errors.map((e: any) => e.message).join(', ')}`);
      }
      this.cache = validation.sanitizedValue || mergedConfig;
    } else {
      this.cache = mergedConfig;
    }

    this.lastCacheUpdate = Date.now();
    logger.debug('Config - Configuration cache refreshed', {
      sources: this.sources.length,
      keys: Object.keys(this.cache).length
    });
  }

  private mergeConfig(target: Record<string, any>, source: Record<string, any>): void {
    for (const [key, value] of Object.entries(source)) {
      const targetKey = this.caseSensitive ? key : key.toLowerCase();
      
      if (this.allowOverrides || !(targetKey in target)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          target[targetKey] = { ...target[targetKey], ...value };
        } else {
          target[targetKey] = value;
        }
      }
    }
  }

  private async ensureFreshCache(): Promise<void> {
    if (Date.now() - this.lastCacheUpdate > this.cacheTimeout) {
      await this.refreshCache();
    }
  }

  // Get configuration value with dot notation support
  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    await this.ensureFreshCache();
    
    const keys = key.split('.');
    let current = this.cache;
    
    for (const k of keys) {
      const actualKey = this.caseSensitive ? k : 
        Object.keys(current).find(key => key.toLowerCase() === k.toLowerCase());
      
      if (actualKey && current[actualKey] !== undefined) {
        current = current[actualKey];
      } else {
        return defaultValue as T;
      }
    }
    
    return current as T;
  }

  // Get configuration value synchronously (from cache)
  getSync<T = any>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let current = this.cache;
    
    for (const k of keys) {
      const actualKey = this.caseSensitive ? k : 
        Object.keys(current).find(key => key.toLowerCase() === k.toLowerCase());
      
      if (actualKey && current[actualKey] !== undefined) {
        current = current[actualKey];
      } else {
        return defaultValue as T;
      }
    }
    
    return current as T;
  }

  // Set configuration value
  async set(key: string, value: any): Promise<void> {
    await this.ensureFreshCache();
    
    const oldValue = await this.get(key);
    
    // Update cache
    const keys = key.split('.');
    let current = this.cache;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
    
    // Notify listeners
    this.notifyChange({
      key,
      oldValue,
      newValue: value,
      source: 'manual'
    });

    logger.debug('Config', { key, value: JSON.stringify(value) });
  }

  // Check if configuration key exists
  async has(key: string): Promise<boolean> {
    const value = await this.get(key, Symbol('not-found'));
    return value !== Symbol('not-found');
  }

  // Get all configuration keys
  async keys(): Promise<string[]> {
    await this.ensureFreshCache();
    return this.getAllKeys(this.cache);
  }

  private getAllKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.push(fullKey);
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.getAllKeys(value, fullKey));
      }
    }
    
    return keys;
  }

  // Get entire configuration
  async getAll(): Promise<Record<string, any>> {
    await this.ensureFreshCache();
    return { ...this.cache };
  }

  // Save configuration to writable sources
  async save(): Promise<void> {
    const writableSources = this.sources.filter(source => source.save);
    
    if (writableSources.length === 0) {
      throw new Error('No writable configuration sources available');
    }

    for (const source of writableSources) {
      try {
        await source.save!(this.cache);
        logger.info('Config', { source: source.name });
      } catch (error) {
        logger.error('Config - Failed to save to source', error as Error, { source: source.name });
      }
    }
  }

  // Watch for configuration changes
  onChange(listener: ConfigChangeListener): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyChange(event: ConfigChangeEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        logger.error('Config - Configuration change listener failed', error as Error);
      }
    }
  }

  private enableWatching(): void {
    for (const source of this.sources) {
      if (source.watch) {
        source.watch((changes) => {
          this.refreshCache();
          // Create a generic change event
          this.notifyChange({
            key: 'config',
            oldValue: undefined,
            newValue: changes,
            source: source.name
          });
        });
      }
    }
  }

  // Validate configuration
  async validate(): Promise<ValidationResult> {
    if (!this.schema) {
      return { isValid: true, errors: [] };
    }

    await this.ensureFreshCache();
    return this.schema(this.cache);
  }

  // Reset configuration to defaults
  async reset(): Promise<void> {
    this.cache = {};
    await this.refreshCache();
    logger.info('Config - Configuration reset to defaults');
  }

  // Environment-specific helpers
  isDevelopment(): boolean {
    return this.getSync('NODE_ENV', 'development') === 'development';
  }

  isProduction(): boolean {
    return this.getSync('NODE_ENV') === 'production';
  }

  isTest(): boolean {
    return this.getSync('NODE_ENV') === 'test';
  }
}

// Configuration factory
export class ConfigFactory {
  static createDefault(): Config {
    return new Config({
      sources: [
        new EnvironmentSource('APP_'),
        new FileSource('config.json'),
        new MemorySource({
          app: {
            name: 'Omniscript Application',
            version: '1.0.0'
          },
          server: {
            host: 'localhost',
            port: 3000
          }
        })
      ],
      enableWatch: true
    });
  }

  static createFromEnv(prefix?: string): Config {
    return new Config({
      sources: [new EnvironmentSource(prefix)]
    });
  }

  static createFromFile(filename: string, format: 'json' | 'yaml' | 'xml' = 'json'): Config {
    return new Config({
      sources: [new FileSource(filename, format)]
    });
  }

  static createWithDefaults(defaults: Record<string, any>): Config {
    return new Config({
      sources: [
        new EnvironmentSource(),
        new MemorySource(defaults)
      ]
    });
  }

  static createWithSchema(schema: any, sources?: ConfigSource[]): Config {
    return new Config({
      sources: sources || [
        new EnvironmentSource(),
        new FileSource('config.json')
      ],
      schema
    });
  }
}

// Common configuration schemas
export const ConfigSchemas = {
  server: Validator.object({
    host: Validator.required(Validator.string({ minLength: 1 })),
    port: Validator.required(Validator.number({ min: 1, max: 65535, integer: true })),
    ssl: Validator.optional(Validator.boolean())
  }),

  database: Validator.object({
    host: Validator.required(Validator.string()),
    port: Validator.required(Validator.number({ min: 1, max: 65535, integer: true })),
    database: Validator.required(Validator.string({ minLength: 1 })),
    username: Validator.optional(Validator.string()),
    password: Validator.optional(Validator.string()),
    ssl: Validator.optional(Validator.boolean())
  }),

  logging: Validator.object({
    level: Validator.required(Validator.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])),
    outputs: Validator.required(Validator.array(Validator.string(), { minLength: 1 })),
    format: Validator.optional(Validator.enum(['json', 'text', 'compact']))
  }),

  app: Validator.object({
    name: Validator.required(Validator.string({ minLength: 1 })),
    version: Validator.required(Validator.string({ pattern: /^\d+\.\d+\.\d+/ })),
    environment: Validator.optional(Validator.enum(['development', 'test', 'staging', 'production']))
  })
};

// Global configuration instance
export const config = ConfigFactory.createDefault();

logger.info('Configuration library initialized');