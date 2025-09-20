import express from 'express';
import dotenv from 'dotenv';
import { loginUser, registerUser } from '../services/auth.js';
dotenv.config();

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, roles } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await registerUser(username, password, roles || []);
    res.json(result);
  } catch (err) {
    console.error('Registration error:', err);

    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password);
    res.json(result);
  } catch (err) {
    const status = err.message === 'User not found' || err.message === 'Invalid password' ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});


export default router;
