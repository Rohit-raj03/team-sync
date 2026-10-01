import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'teamsync_fallback_secret_key'
      );
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Unauthorized, invalid or expired token.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized, no Bearer token provided.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
  }
};

