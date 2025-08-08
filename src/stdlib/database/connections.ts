/* Optional database drivers loaded dynamically to avoid hard dependency failures. */
let SqliteMod: any; // runtime-loaded sqlite3
let PgPool: any;    // runtime-loaded pg Pool
try { SqliteMod = require('sqlite3'); } catch { /* ignore */ }
try { ({ Pool: PgPool } = require('pg')); } catch { /* ignore */ }

export class SQLiteConnection {
  private db?: any;

  constructor(connectionString: string) {
    if (!connectionString.startsWith('sqlite://')) {
      throw new Error('Invalid SQLite connection string');
    }
    if (!SqliteMod) {
      throw new Error('sqlite3 driver not installed');
    }
    const path = connectionString.replace('sqlite://', '');
    this.db = new SqliteMod.Database(path, (err: Error | null) => {
      if (err) console.error('Failed to open SQLite database:', err);
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      this.db.close((err: Error | null) => err ? reject(err) : resolve());
    });
  }
}

export class PostgresConnection {
  private pool?: any;

  constructor(connectionString: string) {
    if (!PgPool) {
      throw new Error('pg driver not installed');
    }
    this.pool = new PgPool({ connectionString });
  }

  async close(): Promise<void> {
    if (this.pool && typeof this.pool.end === 'function') {
      await this.pool.end();
    }
  }
}
