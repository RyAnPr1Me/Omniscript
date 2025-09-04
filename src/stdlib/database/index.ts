export { SQLiteConnection, PostgresConnection } from "./connections";
export {
  id,
  field,
  relation,
  timestamp,
  component,
  state,
  effect,
  computed,
  getMetadata,
  setMetadata,
} from "./decorators";
export { QueryBuilder, Database, createQuery } from "./query-builder";
export type {
  WhereCondition,
  OrderByField,
  OrderDirection,
} from "./query-builder";

// Import Database for re-export
import { Database } from "./query-builder";

// Re-export for convenience
export const db = Database;
