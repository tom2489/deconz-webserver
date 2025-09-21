import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Opens an SQLite database connection.
 *
 * This function uses the `sqlite` wrapper over `sqlite3` to provide a Promise-based API. The
 * database file is located at `./db/database.sqlite`.
 * @async
 * @function
 * @returns {Promise<import('sqlite').Database>} A Promise that resolves to a SQLite Database
 * instance.
 * @example
 * const db = await openDb();
 * await db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT)');
 */
export async function openDb() {
  const dbPath = process.env.NODE_ENV === 'test' ? './db/jest_test_database.db' : './db/database.sqlite';
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}
