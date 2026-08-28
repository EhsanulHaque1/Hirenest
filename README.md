# HireNest

HireNest is a full-stack freelance marketplace that connects **job providers** (clients) with **job seekers** (freelancers). It supports job posting and applications, real-time chat, an AI assistant, payments via SSLCommerz, notifications, and an admin panel for platform moderation.

The project is a **MERN**-style application: a React (Vite) single-page frontend and an Express + MongoDB backend, with Socket.IO for real-time messaging/notifications.

## Tech Stack

**Frontend**
- React 19 + Vite 7
- React Router v7
- Socket.IO client
- React Icons
- ESLint 9

**Backend**
- Node.js + Express 4
- MongoDB with Mongoose 7
- Socket.IO (real-time chat & notifications)
- JWT authentication (`jsonwebtoken`) + `bcrypt` password hashing
- Cookie-based sessions (`cookie-parser`)
- Cloudinary + Multer (file/image uploads — NID, certifications, profile pictures)
- Nodemailer (email verification & password reset)
- SSLCommerz (payment gateway for job posting fees / admin transactions)
- Google Gemini API (AI chat assistant)

## Project Structure

```
HireNest/
├── src/                        # React frontend
│   ├── Components/             # Shared components (Header, Footer, Layout, AI widget, etc.)
│   ├── Pages/                  # Route-level pages (Dashboard, Chat, Payments, Admin*, etc.)
│   ├── utils/                  # Frontend helpers (cookies.js)
│   ├── assets/                 # Images/logos
│   ├── App.jsx                 # Route definitions
│   └── main.jsx                # App entry point
├── server/                     # Express backend
│   ├── controllers/            # Route handlers (auth, jobs, chat, payments, AI, complaints, notifications, profile)
│   ├── models/                 # Mongoose schemas (User, Job, Chat, Conversation, Payment, Notification, Complaint)
│   ├── routes/                 # Express routers, mounted under /api/*
│   ├── middleware/              # auth (JWT), upload (Cloudinary/Multer), errorHandler
│   ├── utils/emailService.js   # Nodemailer email templates/sending
│   ├── connect.cjs             # MongoDB connection
│   ├── index.js                # Main server entry (HTTP + Socket.IO + all routes)
│   └── config.env              # Environment variables (not committed)
├── public/                     # Static assets served by Vite
├── index.html                  # Vite HTML entry
├── vite.config.js              # Vite config (dev proxy to backend on :5004)
└── package.json
```

## Features

- **Authentication** — register, email verification, login (JWT), forgot/reset password, protected routes.
- **Roles** — users register as either `jobSeeker` or `jobProvider`.
- **Profiles** — multi-step profile completion with NID, certifications, and profile picture uploads (Cloudinary).
- **Job marketplace**
  - Providers post jobs, view applicants, accept an applicant, close a job, and rate job seekers.
  - Seekers browse/search jobs, view AI-matched jobs, and apply.
- **Real-time chat** — 1:1 conversations, typing indicators, read receipts, and message deletion over Socket.IO, backed by REST endpoints for history/search.
- **Notifications** — in-app notifications (e.g., new message, application updates) with read/unread state.
- **Payments** — SSLCommerz integration for job-posting fees and admin transactions, with success/fail/cancel redirect pages and IPN handling.
- **AI Assistant** — floating chat widget and a dedicated AI Assistant page powered by Google Gemini.
- **Complaints** — users can submit complaints; admins can review and resolve them.
- **Admin panel** — manage users, view platform stats, manage jobs, manage complaints, and manage admin payments/transactions.

## Prerequisites

- Node.js 18+ and npm
- A MongoDB instance (local or Atlas)
- Accounts/keys for: Cloudinary, an SMTP-capable email provider, SSLCommerz (sandbox is fine for dev), and Google Gemini (for AI features)

## Getting Started

### 1. Clone & install

```bash
git clone <repo-url>
cd HireNest
npm install
```

### 2. Configure environment variables

Create `server/config.env` with the following keys:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5004
JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587

BACKEND_URL=http://localhost:5004

CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_SANDBOX=true

JOB_POSTING_FEE=100
```

### 3. Run the app (development)

Run the backend and frontend in two terminals:

```bash
# Terminal 1 — backend (Express + Socket.IO on PORT, default 5004)
npm run server

# Terminal 2 — frontend (Vite dev server, proxies /api to localhost:5004)
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

### 4. Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

## Available Scripts

| Script                | Description                                      |
|-----------------------|---------------------------------------------------|
| `npm run dev`         | Start the Vite frontend dev server                |
| `npm run build`       | Build the frontend for production                 |
| `npm run preview`     | Preview the production frontend build             |
| `npm run lint`        | Run ESLint over the project                        |
| `npm run server`      | Start the main Express + Socket.IO server (`server/index.js`) |
| `npm run server:user` | Start the alternate user server (`server/index_user.js`) |
| `npm run server:db`   | Run the standalone DB connection script (`server/connect.cjs`) |

## API Overview

All backend routes are prefixed with `/api`. Authenticated routes expect a JWT (via cookie or `Authorization` header, per `middleware/auth.js`).

**Auth** (`/api/auth`, defined in `server/index.js`)
- `POST /register` — create an account (jobSeeker or jobProvider), sends verification email
- `GET /verify-email?token=...` — verify email address
- `POST /resend-verification` — resend the verification email
- `POST /login` — log in, returns JWT
- `POST /forgot-password` / `POST /reset-password` — password recovery flow
- `GET /profile` (auth) / `PUT /profile` (auth, file upload) — get/update own profile
- `PUT /complete-profile` (auth, file upload) — complete profile with NID/certification/profile picture uploads
- `GET /protected` (auth) — sample protected route

**Users**
- `GET /api/users/:userId` — view another user's public profile

**Jobs** (`/api/jobs`)
- `POST /` (auth) — create a job posting
- `GET /` — list jobs
- `GET /matching` (auth) — AI-matched jobs for the logged-in seeker
- `POST /apply` (auth) — apply to a job
- `GET /my-posted` (auth) — jobs posted by the logged-in provider
- `GET /my-applications` (auth) — jobs the logged-in seeker applied to
- `GET /job-seekers` — list job seekers
- `PATCH /:jobId/close` (auth) — close a job
- `POST /accept-applicant` (auth) — accept an applicant
- `POST /rate-seeker` (auth) — rate a job seeker
- `DELETE /:jobId` — delete a job

**Chat** (`/api/chat`, all routes authenticated)
- `GET /conversations` — list conversations
- `GET /messages/:otherUserId` — message history with a user
- `POST /messages` — send a message
- `GET /users/search` — search users to start a conversation
- `PATCH /messages/:otherUserId/read` — mark messages as read
- `DELETE /messages/:messageId` — delete a message
- `DELETE /conversations/:otherUserId` — delete a conversation

**Payments** (`/api/payments`)
- `POST /initialize` (auth) — start an SSLCommerz payment (job posting fee)
- `POST /success` / `POST /fail` / `POST /cancel` / `POST /ipn` — SSLCommerz callbacks
- `GET /status/:transactionId` (auth) — check payment status
- `GET /posting-fee` — current job posting fee
- `GET /admin/closed-jobs`, `GET /admin/transactions`, `POST /admin/initialize-payment`, and matching `admin/payment/*` success/fail/cancel/ipn routes — admin billing flows

**Notifications** (`/api/notifications`, all authenticated)
- `GET /` — list notifications
- `PATCH /read/:notificationId` / `PATCH /read-all` — mark as read
- `DELETE /:notificationId` — delete a notification

**Complaints** (`/api/complaints`)
- `POST /submit` (auth) — submit a complaint
- `GET /` — list complaints
- `GET /all`, `PATCH /:id/status`, `DELETE /:id` — admin moderation (defined in `server/index.js`)

**AI** (`/api/ai`)
- `POST /chat` — send a message to the Gemini-powered assistant

**Admin** (defined in `server/index.js`)
- `GET /api/admin/users` — list all users
- `GET /api/admin/stats` — platform statistics
- `DELETE /api/admin/users/:id` — delete a user

**Health**
- `GET /api/health` — server health check

## Real-time Events (Socket.IO)

The client connects with a JWT in `socket.handshake.auth.token`. Supported events:

- `join_chat` — join a private room with another user
- `send_message` — send a chat message (persists to DB, emits `new_message`, triggers a `message_notification`)
- `typing` — broadcast typing status (`user_typing`)
- `mark_read` — mark a conversation's messages as read (`messages_read`)
- `message_deleted` — broadcast message deletion

## Frontend Routes

Defined in [src/App.jsx](src/App.jsx): Home, Web/App Development, UI/UX Design, Marketing, Post Project/Job, Find Freelancers/Jobs, Browse & Apply, How It Works, Create Profile, Support, Privacy, Terms of Service, Help, Payments (+ success/fail/cancel), Chat, Reviews, AI Assistant, Dashboard, Profile (`/profile` and `/profile/:userId`), Forgot/Reset Password, and Admin (Panel, Page, Jobs, Payment).

## Notes

- `server/index_user.js` and `npm run server:user` appear to be an alternate/legacy server entry — the primary server is `server/index.js` (`npm run server`).
- Never commit real secrets in `server/config.env` or `server/.env` — both are (or should be) covered by `.gitignore`.
