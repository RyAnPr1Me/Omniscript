import { Database as SQLite } from 'sqlite3';
import { Pool, Client } from 'pg';

export class SQLiteConnection {
  private db: SQLite;

  constructor(connectionString: string) {
    const path = connectionString.replace('sqlite://', '');
    this.db = new SQLite(path);
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
