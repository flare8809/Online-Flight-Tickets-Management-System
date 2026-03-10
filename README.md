# ✈ SkyDesk — Node.js Backend

A full REST API backend for the SkyDesk Flight Management Portal.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start          # production
npm run dev        # auto-restart with nodemon
```

Server runs at **http://localhost:3000**

Place your `index.html` inside the `public/` folder — the server serves it at `/`.

---

## API Reference

All `/api/tickets` routes require a **JWT Bearer token** obtained from `/api/auth/login`.

### Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{ fullName, username, email, password }` | Create account |
| POST | `/api/auth/login` | `{ username, password }` | Sign in → returns `{ token, user }` |
| GET  | `/api/auth/me` | — *(Bearer token)* | Get current user |

### Tickets *(all require `Authorization: Bearer <token>`)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | List all tickets (sorted by date/time) |
| GET | `/api/tickets?search=…&fClass=Economy` | Filtered list |
| GET | `/api/tickets/stats` | Aggregate stats (totals, revenue, etc.) |
| POST | `/api/tickets` | Book a new ticket |
| DELETE | `/api/tickets/:flightID` | Void a single boarding pass |
| DELETE | `/api/tickets` | Clear ALL boarding passes |

### POST /api/tickets — Request Body

```json
{
  "name":   "Jane Smith",
  "dest":   "London",
  "date":   "2025-08-15",
  "time":   "14:30",
  "price":  "450",
  "fClass": "Business"
}
```

---

## File Structure

```
skydesk/
├── server.js            ← Express entry point
├── package.json
├── middleware/
│   ├── auth.js          ← JWT verification middleware
│   └── db.js            ← JSON file store (no database needed)
├── routes/
│   ├── auth.js          ← /api/auth/*
│   └── tickets.js       ← /api/tickets/*
├── data/                ← auto-created on first run
│   ├── users.json
│   └── tickets.json
└── public/
    └── index.html       ← your frontend (served statically)
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `JWT_SECRET` | `skydesk-secret-change-in-production` | **Change this in production!** |

```bash
JWT_SECRET=your-strong-secret PORT=8080 node server.js
```

---

## What Changed vs. the Original

The original `index.html` used **localStorage** for everything. The updated version uses this backend instead:

| Original | Backend |
|----------|---------|
| `localStorage.getItem('ftms_users')` | `POST /api/auth/register` + `GET /api/auth/me` |
| `localStorage.getItem('ftms_tickets')` | `GET /api/tickets` |
| `saveTickets(...)` | `POST /api/tickets` |
| `tickets.splice(idx,1)` | `DELETE /api/tickets/:flightID` |
| Passwords stored in plain text | Hashed with **bcrypt** |
| Single-browser only | Shared across all users / devices |
