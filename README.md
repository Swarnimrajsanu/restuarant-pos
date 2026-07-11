# 🍛 RestoPOS — Restaurant Payment Management System

A modern, fast, and easy-to-use POS (Point of Sale) system built for restaurants, tea stalls, cafés, sweet shops, and Indian snack shops.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Express.js, Node.js, Mongoose |
| Database | MongoDB |
| Auth | JWT, bcrypt |
| Charts | Recharts |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install Dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment
Edit `server/.env`:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/restaurant-pos
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

### 3. Seed Database
```bash
cd server && npm run seed
```
This creates:
- **Owner**: owner@restaurant.com / password123
- **Worker**: rahul@restaurant.com / password123
- **32 sample products** across 6 categories

### 4. Start Development Servers
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## User Roles

### 👑 Owner (Admin)
- Dashboard with revenue stats and charts
- Manage products (CRUD)
- View all orders
- Daily and monthly reports
- Register new workers

### 👤 Worker (Cashier)
- POS billing screen
- Search and add products
- Cart management
- Payment method selection (Cash/UPI/Card)
- View today's own orders

## Project Structure

```
restaurant-pos/
├── client/          # Next.js 15 Frontend
│   └── src/
│       ├── app/     # Pages (App Router)
│       ├── components/  # UI Components
│       ├── lib/     # Utilities
│       └── types/   # TypeScript interfaces
├── server/          # Express.js Backend
│   └── src/
│       ├── config/  # DB connection
│       ├── models/  # Mongoose schemas
│       ├── routes/  # API routes
│       ├── controllers/  # Business logic
│       ├── middleware/   # Auth & RBAC
│       └── utils/   # Seed script
└── README.md
```

## API Endpoints

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/auth/login | Public | Login |
| POST | /api/auth/register | Owner | Register worker |
| GET | /api/products | Auth | List products |
| POST | /api/products | Owner | Create product |
| PUT | /api/products/:id | Owner | Update product |
| DELETE | /api/products/:id | Owner | Delete product |
| POST | /api/orders | Auth | Create order |
| GET | /api/orders | Owner | List all orders |
| GET | /api/orders/my | Worker | Today's orders |
| GET | /api/reports/dashboard | Owner | Dashboard stats |
| GET | /api/reports/daily | Owner | Daily report |
| GET | /api/reports/monthly | Owner | Monthly report |
