const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Recycler = require('../models/Recycler');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'user') {
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
    } else if (decoded.role === 'recycler') {
      req.recycler = await Recycler.findById(decoded.id).select('-password');
      if (!req.recycler) {
        return res.status(401).json({
          success: false,
          message: 'Recycler not found'
        });
      }
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
};

module.exports = {
  generateToken,
  protect,
  admin
};