import bcrypt from 'bcrypt';
import { openDb } from '../db/db.js';

/**
 * Retrieves all users from the database.
 * @returns {Promise<Array<{id: number, username: string, roles: string[]}>>} Array of users with parsed roles.
 */
export async function getAllUsers() {
  const db = await openDb();
  const rows = await db.all('SELECT id, username, roles FROM users');
  return rows.map((user) => ({ ...user, roles: JSON.parse(user.roles) }));
}

/**
 * Creates a new user.
 * @param {string} username - The username of the new user.
 * @param {string} password - The plain-text password of the new user.
 * @param {string[]} [roles] - Array of roles assigned to the user.
 * @returns {Promise<{username: string, roles: string[]}>} Created user info (without password).
 */
export async function createUser(username, password, roles = ['user']) {
  const db = await openDb();
  const hashed = await bcrypt.hash(password, 10);
  await db.run(
    'INSERT INTO users(username, password, roles) VALUES (?, ?, ?)',
    username,
    hashed,
    JSON.stringify(roles)
  );
  return { username, roles };
}

/**
 * Updates the roles of a user.
 * Ensures that 'user' role is always present.
 * @param {number} userId - ID of the user to update.
 * @param {string[]} roles - Array of roles to set.
 * @returns {Promise<string[]>} The updated array of roles.
 */
export async function updateUserRoles(userId, roles) {
  const db = await openDb();
  const safeRoles = roles.includes('user') ? roles : [...roles, 'user'];
  await db.run('UPDATE users SET roles = ? WHERE id = ?', JSON.stringify(safeRoles), userId);
  return safeRoles;
}

/**
 * Removes a specific role from a user.
 * @param {number} userId - ID of the user.
 * @param {string} roleToRemove - Role to remove.
 * @returns {Promise<string[]|null>} Updated roles or null if user not found.
 */
export async function removeUserRole(userId, roleToRemove) {
  const db = await openDb();
  const targetUser = await db.get('SELECT roles FROM users WHERE id = ?', userId);
  if (!targetUser) return null;

  const roles =
    typeof targetUser.roles === 'string' ? JSON.parse(targetUser.roles) : targetUser.roles;
  const newRoles = roles.filter((r) => r !== roleToRemove);

  await db.run('UPDATE users SET roles = ? WHERE id = ?', JSON.stringify(newRoles), userId);
  return newRoles;
}

/**
 * Deletes a user from the database.
 * @param {number} userId - ID of the user to delete.
 * @returns {Promise<void>}
 */
export async function deleteUser(userId) {
  const db = await openDb();
  await db.run('DELETE FROM users WHERE id = ?', userId);
}

/**
 * Sets the Deconz API key for a user.
 * @param {number} userId - ID of the user.
 * @param {string} apiKey - API key to set.
 * @returns {Promise<void>}
 */
export async function setDeconzApiKey(userId, apiKey) {
  const db = await openDb();
  await db.run('UPDATE users SET deconz_api_key = ? WHERE id = ?', apiKey, userId);
}

/**
 * Retrieves the Deconz API key of a user.
 * @param {number} userId - ID of the user.
 * @returns {Promise<string|null>} The API key or null if not set.
 */
export async function getDeconzApiKey(userId) {
  const db = await openDb();
  const row = await db.get('SELECT deconz_api_key FROM users WHERE id = ?', userId);
  return row?.deconz_api_key || null;
}

/**
 * Deletes the Deconz API key of a user.
 * @param {number} userId - ID of the user.
 * @returns {Promise<void>}
 */
export async function deleteDeconzApiKey(userId) {
  const db = await openDb();
  await db.run('UPDATE users SET deconz_api_key = NULL WHERE id = ?', userId);
}

/**
 * Checks if any users exist in the database.
 * @returns {Promise<boolean>} True if at least one user exists, otherwise false.
 */
export async function usersExist() {
  const db = await openDb();
  const row = await db.get('SELECT COUNT(*) as count FROM users');
  return row.count > 0;
}
