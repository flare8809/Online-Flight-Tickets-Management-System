/**
 * SkyDesk — Flight Management Portal
 * Node.js / Express Backend
 *
 * Run:
 *   npm install
 *   node server.js
 *
 * API base: http://localhost:3000/api
 */

const express    = require('express');
const cors       = require('cors');
const path       = require('path');

const authRoutes   = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ─────────────────────────────── */
app.use(cors());
app.use(express.json());

/* Serve the frontend HTML from the project root */
app.use(express.static(path.join(__dirname, 'public')));

/* ── API Routes ─────────────────────────────── */
app.use('/api/auth',    authRoutes);
app.use('/api/tickets', ticketRoutes);

/* ── Health check ───────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* ── SPA fallback ───────────────────────────── */
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── Start ──────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`✈  SkyDesk server running → http://localhost:${PORT}`);
});
