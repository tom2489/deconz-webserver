import express from 'express';
import bcrypt from 'bcrypt';
import { openDb } from '../db/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const db = await openDb();

    const users = (await db.all('SELECT id, username, roles FROM users')).map(user => ({
      ...user,
      roles: JSON.parse(user.roles),
    }));

    res.json({ users });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
 


router.post('/', authenticateToken, async (req, res) => {
  if (!req.user.roles.includes('admin')) return res.sendStatus(403);

  const { username, password, roles = ['user'] } = req.body;
  const db = await openDb();
  const hashed = await bcrypt.hash(password, 10);

  await db.run(
    'INSERT INTO users(username, password, roles) VALUES (?, ?, ?)',
    username,
    hashed,
    JSON.stringify(roles)
  );

  res.json({ message: 'User created' });
});

router.post('/deconz-api-key', authenticateToken, async (req, res) => {
  const { apiKey } = req.body;
  const db = await openDb();
  await db.run('UPDATE users SET deconz_api_key = ? WHERE id = ?', apiKey, req.user.id);
  res.json({ success: true });
});

router.delete('/deconz-api-key', authenticateToken, async (req, res) => {
  try {
    const db = await openDb();
    await db.run('UPDATE users SET deconz_api_key = NULL WHERE id = ?', req.user.id);
    res.json({ success: true, message: 'Deconz API key deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete API key.' });
  }
});

router.get('/deconz-api-key', authenticateToken, async (req, res) => {
  try {
    const db = await openDb();
    const row = await db.get('SELECT deconz_api_key FROM users WHERE id = ?', req.user.id);

    if (!row || !row.deconz_api_key) {
      return res.status(404).json({ error: 'No API key found.' });
    }

    res.json({ apiKey: row.deconz_api_key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch API key.' });
  }
});

router.get('/exists', async (req, res) => {
  try {
    const db = await openDb();
    const row = await db.get('SELECT COUNT(*) as count FROM users');
    const usersExist = row.count > 0;
    res.json({ usersExist });
  } catch (err) {
    console.error('Failed to check users existence:', err);
    res.status(500).json({ error: 'Failed to check users existence.' });
  }
});

router.put('/:id/roles', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { roles } = req.body;

    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const db = await openDb();
    const targetUser = await db.get('SELECT * FROM users WHERE id = ?', userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const safeRoles = roles.includes('user') ? roles : [...roles, 'user'];

    if (userId === req.user.id && !safeRoles.includes('admin')) {
      return res.status(400).json({ error: 'You cannot remove your own admin role' });
    }

    await db.run('UPDATE users SET roles = ? WHERE id = ?', JSON.stringify(safeRoles), userId);

    res.json({ roles: safeRoles });
  } catch (err) {
    console.error('Failed to update roles:', err);
    res.status(500).json({ error: 'Failed to update roles' });
  }
});

router.delete('/:id/roles/:role', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const roleToRemove = req.params.role;

    if (!req.user.roles?.includes('admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (roleToRemove === 'user') {
      return res.status(400).json({ error: 'Cannot remove "user" role' });
    }

    if (userId === req.user.id && roleToRemove === 'admin') {
      return res.status(400).json({ error: 'You cannot remove your own admin role' });
    }

    const db = await openDb();
    const targetUser = await db.get('SELECT * FROM users WHERE id = ?', userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const roles = typeof targetUser.roles === 'string' ? JSON.parse(targetUser.roles) : targetUser.roles;
    const newRoles = roles.filter(r => r !== roleToRemove);

    await db.run('UPDATE users SET roles = ? WHERE id = ?', JSON.stringify(newRoles), userId);

    res.json({ message: 'Role removed', roles: newRoles });
  } catch (err) {
    console.error('Failed to remove role:', err);
    res.status(500).json({ error: 'Failed to remove role' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  if (!req.user.roles.includes('admin')) return res.status(403).json({ error: 'Forbidden' });
  if (userId === req.user.id) return res.status(400).json({ error: 'Cannot delete self' });

  const db = await openDb();
  await db.run('DELETE FROM users WHERE id = ?', userId);
  res.json({ success: true });
});

export default router;
