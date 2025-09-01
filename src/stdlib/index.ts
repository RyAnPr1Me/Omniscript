export * from './collections';
export * from './io';
export * from './network';
export * from './crypto';
export * from './datetime';
export * from './math';
export * from './threading';
export * from './http';
export * from './database';
export * from './media';
export * from './ai';
export * from './genetic';
export * from './validation';
export * from './logging';
export * from './cache';
export * from './graphics';
export * from './serialization';
export * from './config';
export * from './audio';

export { MathUtils as Math } from './math';
export { DateTime } from './datetime';
export { AI } from './ai';
export { Genetic } from './genetic';
export { Validator, Sanitizer } from './validation';
export { Logger, LoggerFactory, logger } from './logging';
export { CacheFactory, defaultCache, tieredCache, memoizer } from './cache';
export { Graphics } from './graphics';
export { Serialization, Serialize } from './serialization';
export { Config, ConfigFactory, config } from './config';
export { Audio, Effects } from './audio';

import { SQLiteConnection, PostgresConnection } from './database/connections';

export class Console {
  static log(...args: any[]) {
    console.log(...args);
  }
}

export class HTTP {
  static async fetch(url: string, options?: RequestInit) {
    return fetch(url, options);
  }
}

// Enhanced HTTP exports
export { HTTPClient } from './http/client';

// Add package manager support
export { PackageManager } from '../package-manager';

// Export enhanced database features
export { Database } from './database/query-builder';
export class DatabaseV2 {
  static async connect(connectionString: string) {
    if (connectionString.startsWith('sqlite://')) {
      return new SQLiteConnection(connectionString);
    }
    return new PostgresConnection(connectionString);
  }

  static async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const result = await callback();
    return result;
  }
}

export class DOM {
  static querySelector(selector: string) {
    return document.querySelector(selector);
  }
  
  static createElement(tag: string) {
    return document.createElement(tag);
  }
}
