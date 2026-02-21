# Smart Hackathon & QR Management System

A full-stack web application built with the **MERN stack** to streamline hackathon event management — from participant registration and team formation to real-time QR-based check-ins and an intuitive admin dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The **Smart Hackathon & QR Management System** is designed to eliminate manual overhead in running hackathons. It enables organizers to manage participants, generate unique QR codes for each registrant, scan them for real-time check-ins, and monitor event activity through a live admin dashboard — all from a single platform.

---

## Features

### QR Code Generation & Scanning
- Unique QR codes auto-generated upon participant registration
- QR codes can be downloaded or emailed directly to participants
- Real-time scanning at event entry points for seamless check-in
- Prevents duplicate or unauthorized entries

### Team / Participant Registration
- Individual and team-based registration flows
- Custom registration forms with field validation
- Participant profile management
- Team creation, joining, and management

### Admin Dashboard
- Centralized control panel for event organizers
- View and manage all registered participants and teams
- Track check-in status and attendance in real time
- Export participant data (CSV)
- Manage hackathon rounds, schedules, and announcements

### Real-time Updates & Notifications
- Live check-in status updates on the admin dashboard
- In-app notifications for participants (registration confirmation, announcements)
- Real-time participant count and event stats

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js, React Router, Axios       |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB, Mongoose                   |
| Real-time   | Socket.IO                           |
| QR Code     | QR Code API / `qrcode` npm package  |
| Styling     | Tailwind CSS / CSS Modules          |
| Auth        | JWT (JSON Web Tokens)               |
| Deployment  | Vercel (Frontend), Render (Backend) |

---

## Architecture

```
 client/                   # React Frontend (deployed on Vercel)
    public/
    src/
        components/       # Reusable UI components
        pages/            # Route-level pages
        context/          # Global state (Auth, Socket)
        hooks/            # Custom React hooks
        services/         # API call functions (Axios)
        utils/            # Helper functions

 server/                   # Express Backend (deployed on Render)
     config/               # DB & environment config
     controllers/          # Route logic
     middleware/            # Auth, error handling
     models/               # Mongoose schemas
     routes/               # API route definitions
     utils/                # QR generation, helpers
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smart-hackathon-qr.git
   cd smart-hackathon-qr
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables** (see [Environment Variables](#environment-variables))

5. **Run the development servers**

   In `/server`:
   ```bash
   npm run dev
   ```

   In `/client`:
   ```bash
   npm start
   ```

6. Open your browser at `http://localhost:3000`

---

## Environment Variables

### Server (`/server/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# QR Code API (if using external API)
QR_API_BASE_URL=https://api.qrserver.com/v1/create-qr-code

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### Client (`/client/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## API Reference

### Auth
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | `/api/auth/register`  | Register a new user      |
| POST   | `/api/auth/login`     | Login and receive JWT    |
| GET    | `/api/auth/me`        | Get current user profile |

### Participants
| Method | Endpoint                     | Description                  |
|--------|------------------------------|------------------------------|
| GET    | `/api/participants`          | Get all participants (admin) |
| POST   | `/api/participants/register` | Register for the hackathon   |
| GET    | `/api/participants/:id`      | Get participant by ID        |
| DELETE | `/api/participants/:id`      | Remove a participant (admin) |

### Teams
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | `/api/teams`          | Get all teams         |
| POST   | `/api/teams`          | Create a new team     |
| PUT    | `/api/teams/:id/join` | Join an existing team |
| GET    | `/api/teams/:id`      | Get team details      |

### QR Codes
| Method | Endpoint                      | Description                     |
|--------|-------------------------------|---------------------------------|
| GET    | `/api/qr/generate/:userId`    | Generate QR code for a user     |
| POST   | `/api/qr/scan`                | Scan & validate a QR code       |
| GET    | `/api/qr/status/:userId`      | Get check-in status of a user   |

### Admin
| Method | Endpoint                 | Description                   |
|--------|--------------------------|-------------------------------|
| GET    | `/api/admin/stats`       | Get event statistics          |
| GET    | `/api/admin/checkins`    | Get real-time check-in feed   |
| POST   | `/api/admin/announce`    | Send announcement to all users|

---

## Deployment

### Frontend — Vercel

1. Push your `client/` folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Set the **root directory** to `client`.
4. Add the required environment variables in Vercel's dashboard.
5. Deploy — Vercel handles builds automatically on every push to `main`.

### Backend — Render

1. Push your `server/` folder to a GitHub repository.
2. Go to [render.com](https://render.com) and create a new **Web Service**.
3. Set the **root directory** to `server` and the **start command** to `npm start`.
4. Add all server environment variables in Render's dashboard.
5. Deploy — Render auto-deploys on every push to `main`.

> **Note:** Make sure to update `REACT_APP_API_URL` in your Vercel environment to point to your live Render backend URL after deployment.

---

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) standard for commit messages.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with  for the hackathon community</p>
