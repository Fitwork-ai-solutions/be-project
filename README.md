# Bid & Win — Real-Time Auction Platform

A full-stack auction application built with the MERN stack, Socket.io for real-time bidding, and Google Gemini AI for bid recommendations, predicted item values, and an in-auction chat assistant.

## Features

- **Two roles:** Seller (creates items/auctions) and Bidder (bids on live auctions)
- **Live bidding** — prices update in real time across all connected clients via WebSockets
- **Auto-bid** — bidders set a maximum amount; the system bids automatically when outbid
- **Auction lifecycle** — scheduled → live → ended, managed by a background cron job
- **AI features** (Google Gemini 1.5 Flash):
  - Personalised auction recommendations for bidders
  - AI predicted item value on auction pages
  - In-auction chat assistant
  - Recommended bid price based on category history
- **Seller analytics** — bar charts for bid counts and price performance (Recharts)
- **Image uploads** — local disk (dev) or Cloudinary (production)
- All amounts in Indian Rupees (Rs)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, MongoDB (Mongoose), Socket.io |
| Frontend | React 18, Vite, React Router v6, Recharts |
| Auth | JWT (7-day tokens), bcryptjs |
| AI | Google Gemini 1.5 Flash via REST |
| Images | Multer → local disk / Cloudinary |
| Security | Helmet, express-rate-limit |

## Prerequisites

- Node.js 18+
- MongoDB (local) or a MongoDB Atlas cluster
- A Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))
- *(Production only)* A Cloudinary account (free tier at [cloudinary.com](https://cloudinary.com))

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/Fitwork-ai-solutions/be-project.git
cd be-project
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # fill in your values (see table below)
npm install
npm run dev                 # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env        # set VITE_API_URL if needed
npm install
npm run dev                 # starts on http://localhost:5173
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default 5000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Long random string — run `openssl rand -hex 32` |
| `CLIENT_URL` | Yes | Frontend URL for CORS (e.g. `http://localhost:5173`) |
| `GEMINI_API_KEY` | Yes | From [aistudio.google.com](https://aistudio.google.com) |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name (prod only) |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key (prod only) |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret (prod only) |

> When the three Cloudinary variables are set, images are stored on Cloudinary. Otherwise they are stored locally in `backend/public/uploads/`.

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend URL (defaults to `http://localhost:5000`) |

## Project Structure

```
be-project/
├── backend/
│   ├── src/
│   │   ├── config/         # env.js, db.js, cloudinary.js
│   │   ├── controllers/    # auth, user, item, auction, bid, autoBid, ai
│   │   ├── jobs/           # auctionCron.js — auto-closes expired auctions
│   │   ├── middleware/     # auth.js, multer.js, rateLimit.js, validateObjectId.js
│   │   ├── models/         # User, Item, Category, Auction, Bid, AutoBidConfig
│   │   ├── routes/         # one file per resource
│   │   ├── services/       # autoBid.service.js, gemini.service.js
│   │   ├── socket/         # Socket.io server (real-time bidding)
│   │   ├── utils/          # ApiError.js
│   │   ├── app.js
│   │   └── server.js
│   ├── public/uploads/     # local image storage (gitignored except .gitkeep)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── context/        # AuthContext.jsx
    │   ├── components/     # ProtectedRoute.jsx
    │   ├── hooks/          # useAuctionRoom.js (Socket.io + bid state)
    │   ├── pages/          # Login, Register, Seller/BidderDashboard, AuctionDetail, ...
    │   ├── services/       # api.js (axios), socket.js
    │   └── App.jsx
    └── package.json
```

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register (role: bidder or seller) |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/users/me` | Bearer | Get current user |
| PATCH | `/api/users/me` | Bearer | Update profile / avatar |
| GET | `/api/categories` | — | List categories |
| POST | `/api/categories` | Seller | Create category |
| GET | `/api/items` | Bearer | List items |
| POST | `/api/items` | Seller | Create item (multipart/form-data) |
| GET | `/api/auctions` | — | List auctions (`?status=live&category=id&seller=id`) |
| POST | `/api/auctions` | Seller | Create auction |
| GET | `/api/auctions/stats/seller` | Seller | Bid/price stats for charts |
| GET | `/api/auctions/:id` | — | Get auction detail |
| GET | `/api/auctions/:id/bids` | — | Paginated bid history |
| GET | `/api/auctions/:id/recommended-price` | Bidder | Gemini-powered price suggestion |
| GET/POST/DELETE | `/api/auctions/:id/auto-bid` | Bidder | Manage auto-bid config |
| GET | `/api/ai/recommend` | Bidder | Personalised auction recommendations |
| GET | `/api/ai/auctions/:id/predicted-value` | — | AI predicted item value |
| POST | `/api/ai/auctions/:id/chat` | Bearer | Chat with AI about this auction |

## Socket.io Events

| Direction | Event | Payload |
|-----------|-------|---------|
| Client → Server | `join_auction` | `auctionId` |
| Client → Server | `place_bid` | `{ auctionId, amount }` |
| Server → Client | `bid:new` | `{ bid, bidder }` |
| Server → Client | `auction:price` | `{ currentPrice }` |
| Server → Client | `auction:ended` | `{ auctionId, winner, finalPrice }` |
| Server → Client | `bid_error` | `{ message }` |

## Deployment

### Backend (Render)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `backend`
3. Build command: `npm install`
4. Start command: `node src/server.js`
5. Add all environment variables from the table above

### Frontend (Vercel)

1. Import the repo on [vercel.com](https://vercel.com), set root directory to `frontend`
2. Framework: Vite (auto-detected)
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Vercel handles SPA routing automatically

### Generate a secure JWT_SECRET

```bash
openssl rand -hex 32
```
