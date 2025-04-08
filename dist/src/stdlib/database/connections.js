"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresConnection = exports.SQLiteConnection = void 0;
// @ts-ignore: No type definitions for 'sqlite3'
const sqlite3_1 = __importDefault(require("sqlite3"));
// @ts-ignore: No type definitions for 'pg'
const pg_1 = require("pg");
class SQLiteConnection {
    constructor(connectionString) {
        if (!connectionString.startsWith('sqlite://')) {
            throw new Error('Invalid SQLite connection string');
        }
        const path = connectionString.replace('sqlite://', '');
        this.db = new sqlite3_1.default.Database(path, (err) => {
            if (err) {
                console.error('Failed to open SQLite database:', err);
            }
        });
    }
}
exports.SQLiteConnection = SQLiteConnection;
class PostgresConnection {
    constructor(connectionString) {
        this.pool = new pg_1.Pool({
            connectionString
        });
    }
}
exports.PostgresConnection = PostgresConnection;
