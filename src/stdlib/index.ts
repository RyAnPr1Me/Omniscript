export * from './collections';
export * from './io';
export * from './network';
export * from './crypto';
export * from './datetime';
export * from './math';
export * from './threading';

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

export class Database {
  static async connect(connectionString: string) {
    if (connectionString.startsWith('sqlite://')) {
      return new SQLiteConnection(connectionString);
    }
    return new PostgresConnection(connectionString);
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
