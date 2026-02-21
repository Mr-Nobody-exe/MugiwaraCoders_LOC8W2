# Smart Hackathon & QR Management System — Backend

A robust REST API backend built with Node.js and Express.js, powering the Smart Hackathon & QR Management System. It handles participant registration, QR code generation, role-based access control, and real-time event management — backed by MongoDB Atlas.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [API Reference](#api-reference)
- [QR Code Logic](#qr-code-logic)
- [Security & Middleware](#security--middleware)
- [Database Models](#database-models)
- [Error Handling](#error-handling)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

The backend serves as the core engine of the hackathon management platform. It exposes a RESTful API consumed by the React frontend, handling everything from user authentication with JWT and refresh tokens, to QR code generation and scanning, admin controls, and participant/team management. All data is persisted in MongoDB Atlas with Mongoose as the ODM.

---

## Tech Stack

| Technology       | Purpose                                      |
|------------------|----------------------------------------------|
| Node.js          | Runtime environment                          |
| Express.js       | Web framework and routing                    |
| MongoDB Atlas    | Cloud-hosted NoSQL database                  |
| Mongoose         | MongoDB ODM for schema modeling              |
| JSON Web Tokens  | Access token authentication                  |
| Refresh Tokens   | Persistent session management                |
| qrcode           | Server-side QR code generation               |
| bcryptjs         | Password hashing                             |
| express-rate-limit | API rate limiting                          |
| helmet           | HTTP security headers                        |
| cors             | Cross-origin resource sharing                |
| dotenv           | Environment variable management              |
| morgan           | HTTP request logging                         |

---

## Project Structure

```
server/
├── config/
│   └── db.js                  # MongoDB Atlas connection setup
│
├── controllers/
│   ├── authController.js      # Login, register, refresh token logic
│   ├── participantController.js
│   ├── teamController.js
│   ├── qrController.js        # QR generation and scan validation
│   └── adminController.js     # Admin-only operations
│
├── middleware/
│   ├── authMiddleware.js      # JWT verification
│   ├── roleMiddleware.js      # Role-based access guard
│   ├── rateLimiter.js         # Rate limiting rules
│   └── errorMiddleware.js     # Global error handler
│
├── models/
│   ├── User.js                # User schema (participant/admin)
│   ├── Team.js                # Team schema
│   ├── QRCode.js              # QR code schema with scan status
│   └── RefreshToken.js        # Refresh token store
│
├── routes/
│   ├── authRoutes.js
│   ├── participantRoutes.js
│   ├── teamRoutes.js
│   ├── qrRoutes.js
│   └── adminRoutes.js
│
├── utils/
│   ├── generateTokens.js      # Access + refresh token generation
│   ├── generateQR.js          # QR code creation helper
│   └── apiResponse.js         # Standardized API response format
│
├── .env
├── .gitignore
├── package.json
└── server.js                  # Entry point
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and cluster
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/smart-hackathon-qr.git
   cd smart-hackathon-qr/server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `server/` root. See [Environment Variables](#environment-variables) for all required fields.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000` by default.

5. **Verify the connection**

   On successful startup you should see:
   ```
   Server running on port 5000
   MongoDB Atlas connected successfully
   ```

### Available Scripts

| Script          | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Start server with nodemon (hot reload)|
| `npm start`     | Start server in production mode      |
| `npm test`      | Run test suite                       |

---

## Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
# ── Server ─────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── MongoDB Atlas ───────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hackathon-db?retryWrites=true&w=majority

# ── JWT ─────────────────────────────────────────────
JWT_SECRET=your_jwt_access_secret
JWT_EXPIRES_IN=15m

# ── Refresh Token ───────────────────────────────────
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# ── QR Code ─────────────────────────────────────────
QR_BASE_URL=https://your-frontend-url.vercel.app/checkin

# ── Client ──────────────────────────────────────────
CLIENT_URL=http://localhost:3000
```

> Never commit your `.env` file. It is already included in `.gitignore`.

---

## Authentication

This backend uses a dual-token authentication strategy for secure and persistent sessions.

### How It Works

1. On login, the server issues two tokens:
   - **Access Token** — short-lived (15 minutes), sent in the response body, stored in memory on the client.
   - **Refresh Token** — long-lived (7 days), stored in the database (`RefreshToken` collection) and sent as an `HttpOnly` cookie.

2. The client attaches the access token as a `Bearer` token in the `Authorization` header for every protected request.

3. When the access token expires, the client sends a request to `/api/auth/refresh`. The server validates the refresh token from the cookie, and if valid, issues a new access token.

4. On logout, the refresh token is deleted from the database, invalidating the session.

### Token Flow

```
Client                          Server
  |                               |
  |-- POST /api/auth/login -----> |
  |                               |-- Validate credentials
  |                               |-- Generate access token (15m)
  |                               |-- Generate refresh token (7d)
  |                               |-- Save refresh token to DB
  |<-- { accessToken } + cookie --|
  |                               |
  |-- GET /api/protected          |
  |   Authorization: Bearer <AT> >|
  |                               |-- Verify access token
  |<-- 200 OK -------------------|
  |                               |
  |   (access token expires)      |
  |                               |
  |-- POST /api/auth/refresh ---> |
  |   cookie: refreshToken        |-- Verify refresh token in DB
  |                               |-- Issue new access token
  |<-- { accessToken } ----------|
  |                               |
  |-- POST /api/auth/logout ----> |-- Delete refresh token from DB
  |<-- 200 OK -------------------|
```

---

## Role-Based Access Control

The system supports two roles: `admin` and `participant`.

### Roles

| Role          | Capabilities                                                                 |
|---------------|------------------------------------------------------------------------------|
| `participant` | Register, view own profile, view own team, download own QR code              |
| `admin`       | All participant permissions + manage all users, teams, scan QR codes, export data, send announcements |

### How It Works

Role is stored on the `User` document and embedded in the JWT payload. The `roleMiddleware` reads the role from the decoded token and compares it against the required role for the route.

```javascript
// Example usage in routes
router.get('/admin/stats', protect, authorize('admin'), getStats);
router.get('/participants', protect, authorize('admin'), getAllParticipants);
router.get('/participants/me', protect, authorize('participant', 'admin'), getMe);
```

The `protect` middleware verifies the JWT. The `authorize(...roles)` middleware checks the role. Both must pass for the request to proceed.

---

## API Reference

All routes are prefixed with `/api`. Protected routes require the `Authorization: Bearer <token>` header.

### Auth Routes — `/api/auth`

| Method | Endpoint          | Access  | Description                              |
|--------|-------------------|---------|------------------------------------------|
| POST   | `/register`       | Public  | Register a new participant account       |
| POST   | `/login`          | Public  | Login and receive access + refresh tokens|
| POST   | `/refresh`        | Public  | Get a new access token via refresh token |
| POST   | `/logout`         | Private | Invalidate refresh token and end session |

**POST `/api/auth/register` — Request Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**POST `/api/auth/login` — Request Body**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**POST `/api/auth/login` — Response**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64a1f...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "participant"
  }
}
```

---

### Participant Routes — `/api/participants`

| Method | Endpoint      | Access         | Description                        |
|--------|---------------|----------------|------------------------------------|
| GET    | `/`           | Admin          | Get all registered participants    |
| GET    | `/me`         | Participant    | Get own profile                    |
| GET    | `/:id`        | Admin          | Get a participant by ID            |
| PUT    | `/me`         | Participant    | Update own profile                 |
| DELETE | `/:id`        | Admin          | Remove a participant               |

---

### Team Routes — `/api/teams`

| Method | Endpoint         | Access      | Description                    |
|--------|------------------|-------------|--------------------------------|
| GET    | `/`              | Admin       | Get all teams                  |
| POST   | `/`              | Participant | Create a new team              |
| GET    | `/:id`           | Both        | Get team details               |
| PUT    | `/:id/join`      | Participant | Join an existing team          |
| PUT    | `/:id/leave`     | Participant | Leave a team                   |
| DELETE | `/:id`           | Admin       | Delete a team                  |

---

### QR Code Routes — `/api/qr`

| Method | Endpoint              | Access      | Description                          |
|--------|-----------------------|-------------|--------------------------------------|
| GET    | `/generate/:userId`   | Both        | Generate and return QR code for user |
| POST   | `/scan`               | Admin       | Validate a scanned QR code           |
| GET    | `/status/:userId`     | Both        | Get check-in status of a user        |
| GET    | `/all`                | Admin       | Get all QR codes and scan statuses   |

**POST `/api/qr/scan` — Request Body**
```json
{
  "token": "qr-payload-token-string"
}
```

**POST `/api/qr/scan` — Response**
```json
{
  "success": true,
  "message": "Check-in successful",
  "participant": {
    "id": "64a1f...",
    "name": "Jane Doe",
    "team": "Team Alpha",
    "checkedInAt": "2025-02-21T09:00:00.000Z"
  }
}
```

---

### Admin Routes — `/api/admin`

| Method | Endpoint         | Access | Description                            |
|--------|------------------|--------|----------------------------------------|
| GET    | `/stats`         | Admin  | Event statistics (counts, check-ins)   |
| GET    | `/checkins`      | Admin  | Full check-in log                      |
| POST   | `/announce`      | Admin  | Send announcement to all participants  |
| GET    | `/export`        | Admin  | Export participant data as CSV         |

**GET `/api/admin/stats` — Response**
```json
{
  "success": true,
  "data": {
    "totalParticipants": 120,
    "totalTeams": 30,
    "checkedIn": 87,
    "pending": 33
  }
}
```

---

## QR Code Logic

Each participant is assigned a unique QR code upon registration. The QR code encodes a signed JWT payload (separate from the auth token) that contains the user's ID and a unique nonce. This prevents tampering and replay attacks.

### Generation Flow

1. On registration, `generateQR.js` creates a signed QR token containing `{ userId, nonce, issuedAt }`.
2. The `qrcode` npm package renders this token as a QR code image (PNG or SVG).
3. The QR code image and its token are stored in the `QRCode` collection linked to the user.
4. The participant can download their QR code from their profile page.

### Scanning Flow

1. The admin scans a participant's QR code using the frontend scanner.
2. The encoded token is sent to `POST /api/qr/scan`.
3. The server verifies the token signature and checks for duplicate scans.
4. If valid and not yet scanned, the participant's status is updated to `checked_in` with a timestamp.
5. If already scanned, the server returns a `409 Conflict` response to prevent duplicate entry.

---

## Security & Middleware

Security is implemented in layers across the application.

### Helmet

Sets secure HTTP response headers including `Content-Security-Policy`, `X-Frame-Options`, and `X-XSS-Protection`.

```javascript
app.use(helmet());
```

### CORS

Restricts cross-origin requests to the configured frontend origin only.

```javascript
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
```

### Rate Limiting

Prevents brute-force and abuse using `express-rate-limit`. Different limits are applied per route group:

| Route Group     | Window    | Max Requests |
|-----------------|-----------|--------------|
| `/api/auth`     | 15 minutes| 20           |
| `/api/qr/scan`  | 1 minute  | 30           |
| All other routes| 15 minutes| 100          |

### Password Hashing

All passwords are hashed using `bcryptjs` with a salt round of 12 before being stored in the database. Plain-text passwords are never persisted.

### HttpOnly Cookies

Refresh tokens are stored in `HttpOnly` cookies with the `Secure` and `SameSite=Strict` flags set in production, preventing access from client-side JavaScript.

---

## Database Models

### User

```javascript
{
  name:         String, required
  email:        String, required, unique
  password:     String, required (hashed)
  role:         String, enum: ['participant', 'admin'], default: 'participant'
  team:         ObjectId, ref: 'Team'
  isCheckedIn:  Boolean, default: false
  checkedInAt:  Date
  createdAt:    Date
}
```

### Team

```javascript
{
  name:        String, required, unique
  members:     [ObjectId], ref: 'User'
  leader:      ObjectId, ref: 'User'
  maxSize:     Number, default: 4
  createdAt:   Date
}
```

### QRCode

```javascript
{
  user:        ObjectId, ref: 'User', unique
  token:       String (signed QR payload)
  imageUrl:    String (path or base64)
  scanned:     Boolean, default: false
  scannedAt:   Date
  createdAt:   Date
}
```

### RefreshToken

```javascript
{
  user:        ObjectId, ref: 'User'
  token:       String, required
  expiresAt:   Date, required
  createdAt:   Date
}
```

---

## Error Handling

All errors are caught by a centralized error-handling middleware. The server never leaks stack traces in production.

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes Used

| Code | Meaning                                      |
|------|----------------------------------------------|
| 200  | Success                                      |
| 201  | Resource created                             |
| 400  | Bad request / validation error               |
| 401  | Unauthorized (missing or invalid token)      |
| 403  | Forbidden (insufficient role)                |
| 404  | Resource not found                           |
| 409  | Conflict (e.g. duplicate QR scan, email exists) |
| 429  | Too many requests (rate limit exceeded)      |
| 500  | Internal server error                        |

---

## Deployment

The backend is deployed on [Render](https://render.com) as a Web Service.

### Steps

1. Push the `server/` directory to a GitHub repository.
2. Log in to Render and create a new **Web Service**.
3. Connect your GitHub repository and set the **root directory** to `server`.
4. Set the **build command** to `npm install` and the **start command** to `npm start`.
5. Add all environment variables from your `.env` file in the Render dashboard under **Environment**.
6. Deploy. Render will auto-deploy on every push to the `main` branch.

### Production Checklist

- `NODE_ENV` is set to `production`
- `MONGO_URI` points to your live MongoDB Atlas cluster
- `CLIENT_URL` is set to your live Vercel frontend URL
- All JWT secrets are strong, randomly generated strings
- Rate limiting is active
- HTTPS is enforced (Render provides this by default)

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for all commit messages.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](../LICENSE) file for details.
