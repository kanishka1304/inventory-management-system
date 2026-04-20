const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Root
router.get('/', (req, res) => {
  res.redirect('/products/dashboard');
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') });
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { message: req.flash('error') });
});

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    req.flash('success', 'Registration successful! Please login.');
    res.redirect('/login');

  } catch (err) {
    console.log(err);
    req.flash('error', 'Registration failed');
    res.redirect('/register');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      res.redirect('/products/dashboard');
    } else {
      req.flash('error', 'Invalid credentials');
      res.redirect('/login');
    }

  } catch (err) {
    console.log(err);
    res.redirect('/login');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Dashboard redirect
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.redirect('/products/dashboard');
});

module.exports = router;