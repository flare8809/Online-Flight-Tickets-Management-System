/**
 * routes/auth.js
 *
 * POST /api/auth/register  — create a new account
 * POST /api/auth/login     — sign in, receive JWT
 * GET  /api/auth/me        — get current user info  (protected)
 */

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const { findUserByUsername, findUserByEmail, createUser } = require('../middleware/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── Register ─────────────────────────────────────────────── */
router.post('/register', async (req, res) => {
  const { fullName, username, email, password } = req.body;

  /* Validation (mirrors the frontend checks) */
  if (!fullName || !username || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });

  if (username.length < 3)
    return res.status(400).json({ error: 'Username must be at least 3 characters.' });

  if (!EMAIL_RE.test(email))
    return res.status(400).json({ error: 'Please enter a valid email.' });

  if (password.length < 4)
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });

  if (findUserByUsername(username))
    return res.status(409).json({ error: 'Username already taken.' });

  if (findUserByEmail(email))
    return res.status(409).json({ error: 'Email already registered.' });

  /* Hash password before storing */
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = createUser({ fullName, username, email, password: hashedPassword });

  res.status(201).json({
    message: 'Account created successfully.',
    user: { fullName: newUser.fullName, username: newUser.username, email: newUser.email },
  });
});

/* ── Login ────────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Please enter username and password.' });

  const user = findUserByUsername(username);
  if (!user)
    return res.status(401).json({ error: 'Invalid username or password.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).json({ error: 'Invalid username or password.' });

  const token = jwt.sign(
    { username: user.username, fullName: user.fullName, email: user.email },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { fullName: user.fullName, username: user.username, email: user.email },
  });
});

/* ── Me (protected) ───────────────────────────────────────── */
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
