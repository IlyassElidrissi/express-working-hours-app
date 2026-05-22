const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

exports.verifyToken = (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.jwt) token = req.cookies.jwt;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(new AppError('Not authorized, token missing', 401));

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401));
  }
};
