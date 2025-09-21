import express from 'express';
import dotenv from 'dotenv';
import { loginUser, registerUser } from '../services/auth.js';

dotenv.config();
const router = express.Router();

function handleError(res, err, fallbackMessage = 'Internal server error') {
  console.error(err);

  if (err.message.includes('UNIQUE constraint failed')) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  if (err.message === 'User not found' || err.message === 'Invalid password') {
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: fallbackMessage });
}

router.post('/register', async (req, res) => {
  try {
    const { username, password, roles = [] } = req.body;

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await registerUser(username, password, roles);
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err, 'Failed to register user');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await loginUser(username, password);
    res.json(result);
  } catch (err) {
    handleError(res, err, 'Failed to login');
  }
});

export default router;
