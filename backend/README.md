# HackX 2025 — Full Stack Setup

## Project structure

```
hackx-world/      ← React + Vite frontend
hackx-backend/    ← Express + MongoDB backend
```

---

## 1. Backend setup

```bash
cd hackx-backend

# Install dependencies
npm install

# Copy env and fill in your values
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, CLIENT_URL

# Seed default accounts (admin, judge, mentor, 3 participants)
npm run seed

# Start dev server (port 5000)
npm run dev
```

### Default seed logins

| Role        | Email                  | Password  |
|-------------|------------------------|-----------|
| admin       | admin@hackx.dev        | hackx123  |
| judge       | judge@hackx.dev        | hackx123  |
| mentor      | mentor@hackx.dev       | hackx123  |
| participant | alice@hackx.dev        | hackx123  |
| participant | bob@hackx.dev          | hackx123  |
| participant | carol@hackx.dev        | hackx123  |

---

## 2. Frontend setup

```bash
cd hackx-world

# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev
```

The Vite dev server proxies `/api/*` → `http://localhost:5000` automatically.

---

## API endpoints

### Auth
| Method | Path              | Auth | Description         |
|--------|-------------------|------|---------------------|
| POST   | /api/auth/register| —    | Create account      |
| POST   | /api/auth/login   | —    | Login               |
| GET    | /api/auth/me      | JWT  | Get current user    |
| POST   | /api/auth/logout  | JWT  | Logout              |

### Teams
| Method | Path                   | Auth              | Description          |
|--------|------------------------|-------------------|----------------------|
| GET    | /api/teams             | JWT               | All teams            |
| GET    | /api/teams/:id         | JWT               | Team by ID           |
| POST   | /api/teams             | participant       | Create team          |
| POST   | /api/teams/join        | participant       | Join by invite code  |
| POST   | /api/teams/:id/leave   | participant       | Leave team           |
| POST   | /api/teams/:id/submit  | participant       | Submit PPT/GitHub    |
| PATCH  | /api/teams/:id         | admin             | Update status/mentor |

### Evaluation
| Method | Path                   | Auth         | Description      |
|--------|------------------------|--------------|------------------|
| GET    | /api/eval/leaderboard  | JWT          | Ranked teams     |
| GET    | /api/eval/submissions  | admin/judge  | All submissions  |
| POST   | /api/eval/score/:id    | judge        | Score a team     |
| POST   | /api/eval/shortlist    | admin        | Bulk confirm     |

### QR
| Method | Path                | Auth        | Description        |
|--------|---------------------|-------------|--------------------|
| GET    | /api/qr/my          | participant | My QR data URLs    |
| POST   | /api/qr/scan-entry  | admin       | Gate entry scan    |
| POST   | /api/qr/scan-meal   | admin       | Meal scan          |
| GET    | /api/qr/meal-stats  | admin       | Meal counts        |
| GET    | /api/qr/entry-log   | admin       | Full attendance log|

### Users
| Method | Path                     | Auth  | Description      |
|--------|--------------------------|-------|------------------|
| GET    | /api/users               | admin | All users        |
| GET    | /api/users/mentors       | JWT   | Mentor list      |
| GET    | /api/users/dashboard-stats | admin | Counts        |
| PATCH  | /api/users/:id/verify    | admin | Flip verified    |
| POST   | /api/users/assign-mentor | admin | Assign mentor    |

---

## Data models

### User
```
name, email, password (hashed), role, team (ref),
verified, college, phone,
qrEntry, qrBreakfast, qrLunch, qrDinner (PNG data URLs),
entryUsed, breakfastUsed, lunchUsed, dinnerUsed, checkedInAt
```

### Team
```
name, track, inviteCode, status,
members[] (User refs), leader (User ref), mentor (User ref),
problemStatement, submission { pptUrl, githubUrl, demoUrl },
scores[] { judge, innovation, feasibility, technical, presentation, impact, total, notes },
finalScore, mapX, mapY, color, skinTones[], shirtColors[]
```

### EntryLog
```
user (User ref), type (entry|breakfast|lunch|dinner),
scannedBy (User ref), qrCode, createdAt
```
