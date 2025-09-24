import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const dbDir = path.join(projectRoot, 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

/**
 * Resolves the correct database path depending on environment.
 * - test: in-repo test database
 * - development: in-repo dev database
 * - production (Electron): userData path
 */
function getDbPath() {
  if (process.versions?.electron) {
    try {
      const electron = require('electron');
      const userDataDir = electron.app.getPath('userData');
      if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });
      return path.join(userDataDir, 'database.sqlite');
    } catch {
      // fallback if electron import fails
      const fallbackDir = path.join(os.homedir(), '.myapp');
      if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
      return path.join(fallbackDir, 'database.sqlite');
    }
  }

  const env = process.env.NODE_ENV;

  if (env === 'test') return path.join(dbDir, 'jest_test_database.db');
  if (env === 'development') return path.join(dbDir, 'dev_database.sqlite');

  const fallbackDir = path.join(os.homedir(), '.myapp');
  if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
  return path.join(fallbackDir, 'database.sqlite');
}



/**
 * Opens an SQLite database connection.
 * @async
 * @returns {Promise<import('sqlite').Database>}
 */
export async function openDb() {
  const dbPath = getDbPath();
  console.log(`Opening database at: ${dbPath}`);
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

/**
 * Retrieves the JWT secret for a specific user.
 * @async
 * @param {number} userId - The ID of the user
 * @returns {Promise<string|null>}
 */
export async function getUserSecret(userId) {
  const db = await openDb();
  const user = await db.get('SELECT jwt_secret FROM users WHERE id = ?', userId);
  return user ? user.jwt_secret : null;
}
