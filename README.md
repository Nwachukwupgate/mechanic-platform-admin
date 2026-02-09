# Mechanic Platform Admin

Admin dashboard for the Mechanic Platform. Run the API and this app to manage users, mechanics, bookings, transactions, disputes, and payouts.

## Setup

1. **API running**  
   From `mechanic-platform-api`: ensure the backend is running (`npm run start:dev`) and an admin user exists.

2. **Create first admin**  
   In the API project, set in `.env`:
   ```env
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your_secure_password
   ```
   Then run: `npx prisma db seed`  
   (Or create a `User` in the database with `role: ADMIN`, `emailVerified: true`, and a bcrypt-hashed password.)

3. **Run admin app**
   ```bash
   cd mechanic-platform-admin
   npm install
   npm run dev
   ```
   Open http://localhost:3001 and sign in with the admin email and password.

## Features

- **Dashboard** – Counts for users, mechanics, bookings, revenue, open disputes.
- **Users** – List and view users; filter by search and email verification.
- **Mechanics** – List and view mechanics; verify/unverify; filter by search and verification.
- **Bookings** – List and view bookings; filter by status, user, mechanic, date, dispute; manage disputes (set reason, mark resolved).
- **Transactions** – List all transactions; filter by type, status, user, mechanic, date.
- **Payouts** – List mechanics with balance or owing; record payouts to mechanics.

## Env

- `VITE_API_URL` – Backend base URL (default: `http://localhost:4000`).
