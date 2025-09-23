const jwt = require('jsonwebtoken');
const config = require('../config');

const requireModerator = async (req, res, next) => {
  try {
    // If req.user doesn't exist, verify the JWT ourselves
    if (!req.user) {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      try {
        const decodedToken = jwt.verify(token.slice(7), config.jwt.secret, {
          algorithm: 'HS256',
          expiresIn: config.jwt.expiry
        });
        req.user = decodedToken;
      } catch (jwtError) {
        return res.status(401).json({ message: 'Authentication invalid' });
      }
    }

    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Moderator access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const canModerate = (user) => {
  return user && (user.role === 'moderator' || user.role === 'admin');
};

const canValidateAI = (user) => {
  return canModerate(user);
};

const canMarkSolved = (user) => {
  return canModerate(user);
};

module.exports = {
  requireModerator,
  canModerate,
  canValidateAI,
  canMarkSolved
};