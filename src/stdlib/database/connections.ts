// @ts-ignore: No type definitions for 'sqlite3'
import sqlite3 from 'sqlite3';
// @ts-ignore: No type definitions for 'pg'
import { Pool } from 'pg';

export class SQLiteConnection {
  private db: sqlite3.Database;

  constructor(connectionString: string) {
    if (!connectionString.startsWith('sqlite://')) {
      throw new Error('Invalid SQLite connection string');
    }
    const path = connectionString.replace('sqlite://', '');
    this.db = new sqlite3.Database(path, (err: Error | null) => {
      if (err) {
        console.error('Failed to open SQLite database:', err);
      }
    });
  }
}

export class PostgresConnection {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString
    });
  }
}
