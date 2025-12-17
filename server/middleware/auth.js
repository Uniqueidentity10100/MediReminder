const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authMiddleware = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { user: null };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return { user: null };
    }

    return { user };
  } catch (error) {
    console.error('Auth error:', error.message);
    return { user: null };
  }
};

const requireAuth = (context) => {
  if (!context.user) {
    throw new Error('You must be logged in to perform this action');
  }
  return context.user;
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  authMiddleware,
  requireAuth,
  generateToken
};
