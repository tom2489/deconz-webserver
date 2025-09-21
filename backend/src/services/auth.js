import bcrypt from 'bcrypt';
import { openDb } from '../db/db.js';
import { generateJwt } from '../services/jwt.js';

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hashed) {
  return bcrypt.compare(password, hashed);
}

function parseRoles(roles) {
  try {
    const parsed = JSON.parse(roles);
    if (!Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch {
    throw new Error('Invalid roles data in database');
  }
}

async function withTransaction(db, callback) {
  try {
    await db.run('BEGIN TRANSACTION');
    const result = await callback();
    await db.run('COMMIT');
    return result;
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
}

/**
 * Registers a new user in the database and generates a JWT token.
 *
 * This function checks if an admin user already exists. If no admin exists,
 * the new user is automatically assigned the `admin` role in addition to
 * any roles provided. The password is securely hashed before storing.
 * @async
 * @param {string} username - The username for the new user account.
 * @param {string} password - The plain text password for the new user.
 * @param {string[]} [roles] - Optional array of roles to assign to the user.
 * @returns {Promise<{ user: { id: number, username: string, roles: string[] }, token: string }>}
 *          A promise that resolves to the newly created user object and a JWT token.
 * @throws {Error} Throws if the database transaction fails or user creation encounters an error.
 * @example
 * const result = await registerUser('alice', 'secret123', ['user']);
 * console.log(result.user.id); // new user ID
 * console.log(result.token); // JWT token
 */
export async function registerUser(username, password, roles = ['user']) {
  const db = await openDb();

  return withTransaction(db, async () => {
    const { count } = await db.get(
      'SELECT COUNT(*) as count FROM users WHERE json_extract(roles, "$") LIKE "%admin%"'
    );
    const adminExists = count > 0;

    let userRoles = roles.length ? [...roles] : ['user'];
    if (!adminExists && !userRoles.includes('admin')) {
      userRoles.push('admin');
    }

    const hashed = await hashPassword(password);

    const { lastID: userId } = await db.run(
      'INSERT INTO users(username, password, roles) VALUES (?, ?, ?)',
      username,
      hashed,
      JSON.stringify(userRoles)
    );

    const token = generateJwt({ id: userId, username, roles: userRoles });

    return { user: { id: userId, username, roles: userRoles }, token };
  });
}

/**
 * Authenticates a user with the given username and password.
 *
 * This function looks up the user in the database by username. If the user exists,
 * it verifies the password using a secure hash comparison. On successful authentication,
 * it returns a JWT token and the user's details including their roles.
 * @async
 * @param {string} username - The username of the user trying to log in.
 * @param {string} password - The plain text password to verify.
 * @returns {Promise<{ token: string, user: { id: number, username: string, roles: string[] } }>}
 *          A promise that resolves to an object containing a JWT token and the user's info.
 * @throws {Error} Throws 'User not found' if the username does not exist.
 * @throws {Error} Throws 'Invalid password' if the password verification fails.
 * @example
 * const result = await loginUser('alice', 'secret123');
 * console.log(result.token); // JWT token
 * console.log(result.user.roles); // ['user']
 */
export async function loginUser(username, password) {
  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE username = ?', username);

  if (!user) throw new Error('User not found');

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Error('Invalid password');

  const roles = parseRoles(user.roles);

  const token = generateJwt({ id: user.id, username: user.username, roles });
  return { token, user: { id: user.id, username: user.username, roles } };
}
