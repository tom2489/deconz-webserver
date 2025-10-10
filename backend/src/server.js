// backend/src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { openDb } from './db/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

// Needed for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Health endpoint for Electron
app.get('/_health', (req, res) => res.status(200).send('OK'));

const isDev = process.env.NODE_ENV === 'development';

// Serve frontend only in production
if (!isDev) {
  const publicDir = path.join(__dirname, '..', 'public');
  const indexFile = path.join(publicDir, 'index.html');

  if (fs.existsSync(indexFile)) {
    app.use(express.static(publicDir));
    app.use((req, res) => {
      res.sendFile(indexFile);
    });
  }
}


// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', async () => {
  try {
    const db = await openDb();

    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        roles TEXT,
        jwt_secret TEXT
      )
    `);

    console.log(`Server running on http://127.0.0.1:${PORT}`);
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
});
