import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/users.js';
import { openDb } from '../db/db.js';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

beforeAll(async () => {
  const db = await openDb();
  await db.run('DELETE FROM users');
});

describe('User lifecycle', () => {
  const username = 'jest_test_user';
  const password = '12345';
  let token;

  test('Register user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username, password });
    expect(res.statusCode).toBe(201);
    token = res.body.token;
  });

  test('Register same user again should fail', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username, password });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Username already exists');
  });

  test('Login user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username, password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('Try deleting current user', async () => {
    const db = await openDb();
    const user = await db.get('SELECT id FROM users WHERE username = ?', username);
    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });
});