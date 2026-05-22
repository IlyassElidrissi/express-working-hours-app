const express = require('express');
const path = require('path');
const workingHoursMiddleware = require('./middleware/workingHours');

const app = express();

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Apply working hours middleware to all routes
app.use(workingHoursMiddleware);

// Routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/services', (req, res) => {
  res.render('services');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
