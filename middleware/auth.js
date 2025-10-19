const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '访问被拒绝，需要token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'token无效' });
    }

    req.userId = user._id;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(401).json({ message: 'token无效' });
  }
};

module.exports = auth;
