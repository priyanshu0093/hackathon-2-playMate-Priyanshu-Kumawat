# PlayMate — Find Players. Book Grounds. Play Together.

> Production-ready, multi-city sports venue discovery, matchmaking, and real-time turf booking platform.

---

## 🚀 Key Highlights & Architecture

- **Server-Verified Identity & RBAC**: JWT-signed tokens with hashed passwords (bcrypt). Complete removal of trusted client headers (`x-user-id`, `x-user-role`). Ownership enforcement on every protected endpoint.
- **Persistent Database (PostgreSQL 16)**: Normalized schemas for `users`, `turfs`, `matches`, and `bookings`. Fully idempotent database migrations and seeding (`npm run db:migrate`).
- **Atomic Concurrency Protection**: Database-level transactions (`BEGIN` / `COMMIT` / `ROLLBACK` with `FOR UPDATE`) and partial unique constraint (`unique_active_slot_booking ON bookings (ground_id, normalized_date, normalized_time_slot) WHERE status != 'cancelled'`). Zero double-booking across multiple server instances; returns HTTP 409 Conflict with clear error details.
- **City-Scoped Real-Time Streaming**: Server-Sent Events (SSE) scoped by city. Turf listings, match updates, and public slot availability are broadcasted only to clients subscribed to that city. Private booking updates are delivered strictly to the authorized player or venue owner.
- **Safe Payment Workflow**: State transitions marked as sandbox/demo pending verification. No unauthorized auto-clearing without provider webhooks.
- **Rich Responsive UI**: Modern sports aesthetic, dark mode support, seamless player and turf owner workflows, live filtering, and zero page refreshes.

---

## 🛠️ Project Structure

```
hackathon-2/
├── backend/
│   ├── db/
│   │   └── index.js          # PostgreSQL connection pool, schema, normalizers & seed
│   ├── middleware/
│   │   └── auth.js           # Server-side JWT authentication & RBAC middleware
│   ├── scripts/
│   │   └── migrate.js        # Automated DB schema migration & idempotent seed script
│   ├── server.js             # Express API & scoped SSE streaming server
│   ├── package.json
│   ├── .env.example          # Environment variables template
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/       # Player & Owner panels, ground details, modals
│   │   ├── context/          # AppContext with server-verified auth & SSE wiring
│   │   ├── pages/            # Landing page, Login/Signup, Player & Owner layouts
│   │   └── utils/            # City normalizers & helpers
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
├── .gitignore                # Root gitignore protecting credentials & dependencies
└── README.md
```

---

## 📦 Local Setup Instructions

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL 16**

### 2. Database Setup & Migrations
1. Start your PostgreSQL service.
2. Create the `playmate` database:
   ```bash
   createdb playmate
   ```
3. Configure `backend/.env` (see `backend/.env.example`):
   ```env
   PORT=5001
   DATABASE_URL=postgresql://<username>:<password>@localhost:5432/playmate
   JWT_SECRET=your_super_secret_jwt_key
   CORS_ORIGIN=http://localhost:5174,http://localhost:5173
   ```
4. Run migrations and demo seed:
   ```bash
   cd backend
   npm install
   npm run db:migrate
   ```

### 3. Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5001
# Real-time SSE endpoint at http://localhost:5001/api/turfs/stream
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5174
```

---

## ⚡ Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Player** | `alex.morgan@playmate.io` (or `player@playmate.io`) | `playmate123` |
| **Turf Owner** | `sunil@kickoffarena.com` (or `owner@playmate.io`) | `playmate123` |

---

## 📋 Production Readiness Checklist Before Public Launch

1. **Real Payment Gateway Integration**: Wire Razorpay / Stripe webhooks to verify signatures before marking `payment_status: 'paid'` and `refund_status: 'refunded'`.
2. **Production Database & Connection Pooling**: Deploy managed PostgreSQL (AWS RDS / Supabase / Neon) with SSL (`ssl: { rejectUnauthorized: false }`) and PgBouncer.
3. **Environment Secrets**: Store production `JWT_SECRET` and database credentials in AWS Secrets Manager or platform environment variables.
4. **Rate Limiting & Security Headers**: Add `express-rate-limit` on `/api/auth/*` and `helmet` middleware for security headers.
