import express from 'express';
import bcrypt from 'bcrypt';
import { openDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const db = await openDb();
  const users = await db.all('SELECT id, username, role FROM users');
  res.json(users);
});

router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { username, password, role } = req.body;
  const db = await openDb();
  const hashed = await bcrypt.hash(password, 10);
  await db.run(
    'INSERT INTO users(username, password, role) VALUES (?, ?, ?)',
    username,
    hashed,
    role
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

export default router;
