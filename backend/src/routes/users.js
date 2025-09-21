import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import * as usersService from '../services/users.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user.roles?.includes('admin')) return res.status(403).json({ error: 'Forbidden' });

    const users = await usersService.getAllUsers();
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  if (!req.user.roles?.includes('admin')) return res.status(403).json({ error: 'Forbidden' });
  const { username, password, roles = ['user'] } = req.body;
  try {
    const user = await usersService.createUser(username, password, roles);
    res.json({ message: 'User created', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:id/roles', authenticateToken, async (req, res) => {
  try {
    if (!req.user.roles?.includes('admin')) return res.status(403).json({ error: 'Forbidden' });

    const userId = parseInt(req.params.id);
    const { roles } = req.body;

    if (userId === req.user.id && !roles.includes('admin')) {
      return res.status(400).json({ error: 'Cannot remove your own admin role' });
    }

    const safeRoles = await usersService.updateUserRoles(userId, roles);
    res.json({ roles: safeRoles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update roles' });
  }
});

router.delete('/:id/roles/:role', authenticateToken, async (req, res) => {
  try {
    if (!req.user.roles?.includes('admin')) return res.status(403).json({ error: 'Forbidden' });

    const userId = parseInt(req.params.id);
    const roleToRemove = req.params.role;

    if (roleToRemove === 'user')
      return res.status(400).json({ error: 'Cannot remove "user" role' });
    if (userId === req.user.id && roleToRemove === 'admin') {
      return res.status(400).json({ error: 'Cannot remove your own admin role' });
    }

    const newRoles = await usersService.removeUserRole(userId, roleToRemove);
    if (!newRoles) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Role removed', roles: newRoles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove role' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (!req.user.roles.includes('admin')) return res.status(403).json({ error: 'Forbidden' });
    if (userId === req.user.id) return res.status(400).json({ error: 'Cannot delete self' });

    await usersService.deleteUser(userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.post('/deconz-api-key', authenticateToken, async (req, res) => {
  await usersService.setDeconzApiKey(req.user.id, req.body.apiKey);
  res.json({ success: true });
});

router.get('/deconz-api-key', authenticateToken, async (req, res) => {
  const apiKey = await usersService.getDeconzApiKey(req.user.id);
  if (!apiKey) return res.status(404).json({ error: 'No API key found.' });
  res.json({ apiKey });
});

router.delete('/deconz-api-key', authenticateToken, async (req, res) => {
  await usersService.deleteDeconzApiKey(req.user.id);
  res.json({ success: true, message: 'Deconz API key deleted.' });
});

router.get('/exists', async (req, res) => {
  const exists = await usersService.usersExist();
  res.json({ usersExist: exists });
});

export default router;
