const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// In-memory user store (replace with DB in production)
const users = [];

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

exports.signup = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Email and password required', 400));
  if (users.find(u => u.email === email)) return next(new AppError('User already exists', 400));

  const hashed = await bcrypt.hash(password, 12);
  const user = { id: `${Date.now()}`, email, password: hashed };
  users.push(user);

  const token = signToken(user);
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.status(201).json({ status: 'success', data: { user: { id: user.id, email: user.email } } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Email and password required', 400));
  const user = users.find(u => u.email === email);
  if (!user) return next(new AppError('Invalid credentials', 401));
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return next(new AppError('Invalid credentials', 401));

  const token = signToken(user);
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.json({ status: 'success' });
});

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.json({ status: 'success' });
};

// Helper for Passport Google strategy to find/create user
exports.findOrCreateOAuthUser = async ({ email }) => {
  let user = users.find(u => u.email === email);
  if (!user) {
    user = { id: `${Date.now()}`, email, password: null };
    users.push(user);
  }
  return user;
};

exports._users = users;
