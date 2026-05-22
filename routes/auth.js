const express = require('express');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const AppError = require('../utils/appError');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, try again later',
});

router.post('/signup', authController.signup);
router.post('/login', loginLimiter, authController.login);
router.get('/logout', authController.logout);

// Google OAuth
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return next(new AppError('Google auth not configured', 500));
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return next(new AppError('Google auth not configured', 500));
  }
  passport.authenticate('google', { session: false }, (err, userProfile) => {
    if (err) return next(err);
    if (!userProfile || !userProfile.email) return next(new AppError('Google did not return an email', 400));
    (async () => {
      const user = await authController.findOrCreateOAuthUser({ email: userProfile.email });
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
      res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.redirect('/');
    })().catch(next);
  })(req, res, next);
});

module.exports = router;
