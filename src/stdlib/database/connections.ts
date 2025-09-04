/* Optional database drivers loaded dynamically to avoid hard dependency failures. */
let SqliteMod:
  | { Database: new (path: string, cb: (err: Error | null) => void) => unknown }
  | undefined; // runtime-loaded sqlite3
let PgPool:
  | {
      new (config: { connectionString: string }): { end?: () => Promise<void> };
    }
  | undefined; // runtime-loaded pg Pool
// try { SqliteMod = require('sqlite3'); } catch { /* ignore */ }
// try { ({ Pool: PgPool } = require('pg')); } catch { /* ignore */ }

export class SQLiteConnection {
  private db?: { close: (cb: (err: Error | null) => void) => void };

  constructor(connectionString: string) {
    if (!connectionString.startsWith("sqlite://")) {
      throw new Error("Invalid SQLite connection string");
    }
    if (!SqliteMod) {
      throw new Error("sqlite3 driver not installed");
    }
    const path = connectionString.replace("sqlite://", "");
    this.db = new SqliteMod.Database(path, (err: Error | null) => {
      if (err) console.error("Failed to open SQLite database:", err);
    }) as { close: (cb: (err: Error | null) => void) => void };
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      this.db.close((err: Error | null) => (err ? reject(err) : resolve()));
    });
  }
}

export class PostgresConnection {
  private pool?: { end?: () => Promise<void> };

  constructor(connectionString: string) {
    if (!PgPool) {
      throw new Error("pg driver not installed");
    }
    this.pool = new PgPool({ connectionString });
  }

  async close(): Promise<void> {
    if (this.pool && typeof this.pool.end === "function") {
      await this.pool.end();
    }
  }
}
