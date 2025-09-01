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

// New expanded standard library modules
export * from './fs';
export * from './json';
export * from './regex';
export * from './encoding';
export * from './path';

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

// Export new modules with convenient aliases
export { FileSystem as FS } from './fs';
export { Json as JSON } from './json';
export { Regex as RegExp } from './regex';
export { Encoding } from './encoding';
export { Path } from './path';

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

  static createServer(path: string, handler: (req: any, res: any) => void) {
    // Import HTTPServer here to avoid circular dependencies
    const { HTTPServer } = require('./http/server');
    const server = new HTTPServer();
    server.get(path, handler);
    server.listen(3000, () => {
      console.log(`Server running on port 3000`);
    });
    return server;
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
