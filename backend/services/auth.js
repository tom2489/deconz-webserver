import bcrypt from 'bcrypt';
import { openDb } from '../db/db.js';
import { generateJwt } from './jwt.js';


export async function registerUser(username, password, roles = ['user']) {
  const db = await openDb();

  try {
    await db.run('BEGIN TRANSACTION');

    const adminRow = await db.get(
      'SELECT COUNT(*) as count FROM users WHERE json_extract(roles, "$") LIKE "%admin%"'
    );
    const adminExists = adminRow.count > 0;

    let userRoles = roles.length ? roles : ['user'];
    if (!adminExists && !userRoles.includes('admin')) userRoles.push('admin');

    const hashed = await bcrypt.hash(password, 10);

    await db.run(
      'INSERT INTO users(username, password, roles) VALUES (?, ?, ?)',
      username,
      hashed,
      JSON.stringify(userRoles)
    );

    await db.run('COMMIT');

    const token = generateJwt({ username, roles: userRoles });

    return { user: { username, roles: userRoles }, token };
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
}

export async function loginUser(username, password) {
  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE username = ?', username);
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid password');

  let roles;
  try {
    roles = JSON.parse(user.roles);
    if (!Array.isArray(roles)) throw new Error('Roles is not an array');
  } catch (err) {
    throw new Error('Invalid roles data in database');
  }

  const token = generateJwt({ id: user.id, roles });
  return { token, user: { id: user.id, username: user.username, roles } };
}