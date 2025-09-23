const requireModerator = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
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