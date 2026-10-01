import jwt from 'jsonwebtoken';

export const generateToken = (userId, role = 'member') => {
  const secret = process.env.JWT_SECRET || 'teamsync_fallback_secret_key';
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};
