require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const workingHoursMiddleware = require('./middleware/workingHours');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const authController = require('./controllers/authController');

const app = express();

// Basic security
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// Body parsing and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Working hours middleware
app.use(workingHoursMiddleware);

// Passport Google strategy (optional - requires env vars)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
  }, (accessToken, refreshToken, profile, done) => {
    const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || null;
    return done(null, { email });
  }));
  app.use(passport.initialize());
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Views
app.get('/', (req, res) => res.render('home'));
app.get('/services', (req, res) => res.render('services'));
app.get('/contact', (req, res) => res.render('contact'));

// 404 page
app.use((req, res) => res.status(404).render('404'));

// Centralized error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
