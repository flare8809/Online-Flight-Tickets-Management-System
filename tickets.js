/**
 * routes/tickets.js
 *
 * All routes require a valid JWT (Bearer token).
 *
 * GET    /api/tickets          — list all tickets (sorted by date/time)
 * POST   /api/tickets          — create a new ticket / boarding pass
 * DELETE /api/tickets/:flightID — void (delete) a single ticket
 * DELETE /api/tickets           — clear ALL tickets
 * GET    /api/tickets/stats     — aggregate stats (used by the stat cards)
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const { getAllTickets, addTicket, deleteTicketById, clearAllTickets } = require('../middleware/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/* All ticket routes are protected */
router.use(authenticate);

/* ── Helpers (same logic as the original frontend) ─────────── */
function genID() {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return c[Math.floor(Math.random() * 26)] +
         c[Math.floor(Math.random() * 26)] +
         '-' +
         (1000 + Math.floor(Math.random() * 9000));
}

function genGate() {
  return ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)] +
         (Math.floor(Math.random() * 25) + 1);
}

function genSeat() {
  return (Math.floor(Math.random() * 50) + 1) +
         String.fromCharCode(65 + Math.floor(Math.random() * 6));
}

/* ── GET /api/tickets ──────────────────────────────────────── */
router.get('/', (req, res) => {
  let tickets = getAllTickets();

  /* Optional search & class filter (mirrors frontend render logic) */
  const { search, fClass } = req.query;
  if (search) {
    const q = search.toLowerCase();
    tickets = tickets.filter(t =>
      (t.name + t.dest + t.flightID + t.gate + t.seat + (t.issuedBy || ''))
        .toLowerCase().includes(q)
    );
  }
  if (fClass) {
    tickets = tickets.filter(t => t.fClass === fClass);
  }

  res.json({ tickets, total: tickets.length });
});

/* ── GET /api/tickets/stats ────────────────────────────────── */
router.get('/stats', (req, res) => {
  const tickets = getAllTickets();
  const today   = new Date().toISOString().split('T')[0];

  const totalTickets = tickets.length;
  const revenue      = tickets.reduce((s, t) => s + parseFloat(t.price || 0), 0);
  const destinations = new Set(tickets.map(t => t.dest.toLowerCase())).size;
  const todayCount   = tickets.filter(t => t.date === today).length;

  res.json({ totalTickets, revenue, destinations, todayCount });
});

/* ── POST /api/tickets ─────────────────────────────────────── */
router.post('/', (req, res) => {
  const { name, dest, date, time, price, fClass } = req.body;

  if (!name || !dest || !price || !date || !time)
    return res.status(400).json({ error: 'Please fill in all fields.' });

  const ticket = {
    name,
    dest,
    date,
    time,
    price: parseFloat(price),
    fClass: fClass || 'Economy',
    seat:      genSeat(),
    flightID:  genID(),
    gate:      genGate(),
    issuedBy:  req.user.username,
    issuedAt:  new Date().toISOString(),
    id:        uuidv4(),          // internal unique key
  };

  addTicket(ticket);
  res.status(201).json({ ticket });
});

/* ── DELETE /api/tickets  (clear ALL) ──────────────────────── */
router.delete('/', (req, res) => {
  clearAllTickets();
  res.json({ message: 'All boarding passes cleared.' });
});

/* ── DELETE /api/tickets/:flightID (void one) ──────────────── */
router.delete('/:flightID', (req, res) => {
  const deleted = deleteTicketById(req.params.flightID);
  if (!deleted)
    return res.status(404).json({ error: 'Ticket not found.' });
  res.json({ message: 'Boarding pass voided.' });
});

module.exports = router;
