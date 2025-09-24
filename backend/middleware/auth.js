import jwt from 'jsonwebtoken';
import { openDb } from '../src/db/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  let decoded;
  try {
    decoded = jwt.decode(token);
    if (!decoded || !decoded.id) return res.sendStatus(403);

    const db = await openDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', decoded.id);
    if (!user || !user.jwt_secret) return res.sendStatus(403);

    jwt.verify(token, user.jwt_secret, (err, verifiedUser) => {
      if (err) return res.sendStatus(403);

      if (!Array.isArray(verifiedUser.roles)) {
        verifiedUser.roles = [verifiedUser.roles || 'user'];
      }

      req.user = verifiedUser;
      next();
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(403);
  }
};
