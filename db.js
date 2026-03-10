/**
 * db.js — lightweight JSON file store
 * Replaces localStorage with server-side persistence.
 * Data is kept in /data/users.json and /data/tickets.json
 */

const fs   = require('fs');
const path = require('path');

const DATA_DIR    = path.join(__dirname, '..', 'data');
const USERS_FILE  = path.join(DATA_DIR, 'users.json');
const TICKETS_FILE= path.join(DATA_DIR, 'tickets.json');

/* Ensure data directory and seed files exist */
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE))   fs.writeFileSync(USERS_FILE,   '[]', 'utf8');
if (!fs.existsSync(TICKETS_FILE)) fs.writeFileSync(TICKETS_FILE, '[]', 'utf8');

/* ── Generic helpers ──────────────────────── */
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/* ── Users ─────────────────────────────────── */
const getUsers   = ()           => readJSON(USERS_FILE);
const saveUsers  = (users)      => writeJSON(USERS_FILE, users);

const findUserByUsername = (username) =>
  getUsers().find(u => u.username === username);

const findUserByEmail = (email) =>
  getUsers().find(u => u.email === email);

const createUser = (userData) => {
  const users = getUsers();
  users.push(userData);
  saveUsers(users);
  return userData;
};

/* ── Tickets ───────────────────────────────── */
const getTickets  = ()          => readJSON(TICKETS_FILE);
const saveTickets = (tickets)   => writeJSON(TICKETS_FILE, tickets);

const getAllTickets = () =>
  getTickets().sort(
    (a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
  );

const addTicket = (ticket) => {
  const tickets = getTickets();
  tickets.push(ticket);
  saveTickets(tickets);
  return ticket;
};

const deleteTicketById = (flightID) => {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.flightID === flightID);
  if (idx === -1) return false;
  tickets.splice(idx, 1);
  saveTickets(tickets);
  return true;
};

const clearAllTickets = () => saveTickets([]);

module.exports = {
  getUsers, saveUsers,
  findUserByUsername, findUserByEmail, createUser,
  getAllTickets, addTicket, deleteTicketById, clearAllTickets,
};
