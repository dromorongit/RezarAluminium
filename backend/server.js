const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'rezar-admin-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');

app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);

// Public API for frontend
app.get('/api/products', (req, res) => {
  // This will be handled in productRoutes
});

app.get('/api/products/featured', (req, res) => {
  // This will be handled in productRoutes
});

// Serve admin views
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  if (req.session.admin) {
    res.sendFile(path.join(__dirname, 'views/admin-dashboard.html'));
  } else {
    res.redirect('/admin/login');
  }
});

// Redirect root to login
app.get('/', (req, res) => {
  res.redirect('/admin/login');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});