import { Database } from 'sqlite3';
import { Pool } from 'pg';

export class SQLiteConnection {
  private db: Database;

  constructor(connectionString: string) {
    const path = connectionString.replace('sqlite://', '');
    this.db = new Database(path);
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
