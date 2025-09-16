import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { openDb } from '../db.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const db = await openDb();

  const existing = await db.get('SELECT id FROM users WHERE username = ?', username);
  if (existing) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const result = await db.run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    username,
    password_hash,
    role || 'user'
  );

  res.status(201).json({ id: result.lastID, username, role: role || 'user' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE username = ?', username);
  if (!user) return res.status(400).json({ error: 'User not found' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

export default router;
