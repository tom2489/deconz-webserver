import jwt from 'jsonwebtoken';

/**
 * Generates a JWT for a user using their per-user secret.
 * @param {Object} payload - The payload to include in the JWT (e.g., { id, username, roles })
 * @param {string} userSecret - The secret key for this specific user
 * @returns {string} Signed JWT
 */
export const generateJwt = (payload, userSecret) => {
  if (!userSecret) {
    throw new Error('User secret is required to generate JWT');
  }
  return jwt.sign(payload, userSecret, { expiresIn: '1h' });
};
