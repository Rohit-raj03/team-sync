import jwt from 'jsonwebtoken';

/**
 * Generate JSON Web Token (JWT)
 * @param {string} userId - User's MongoDB _id
 * @param {string} role - User's role (admin/manager/member)
 * @returns {string} Signed JWT string
 */
export const generateToken = (userId, role = 'member') => {
  const secret = process.env.JWT_SECRET || 'teamsync_fallback_secret_key';
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};
