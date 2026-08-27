# FreelanceHub (SB Works) — MERN Freelancing Platform

> **"Empower Your Journey: Elevate Your Craft on SB Works"**  
> *SmartBridge MERN Internship Project*

---

## 1. Project Overview

**SB Works (FreelanceHub)** is a full-stack MERN freelancing web application connecting **Clients** with **Freelancers**. 
Clients post projects, freelancers submit bids and proposals, clients approve a single freelancer per project, both parties collaborate in a dedicated **Socket.IO real-time chat room**, freelancers deliver completed work (with repository links, manuals, and file uploads), and clients mark projects as completed to release wallet funds and submit 5-star reviews. An **Admin Control Hub** oversees user moderation, disputes, and platform analytics.

---

## 2. Tech Stack

### Frontend (`client/`)
- **React 18** (Vite build tool)
- **Redux Toolkit** (`@reduxjs/toolkit`, `react-redux`) for global state management
- **React Router v6** (`react-router-dom`) with `ProtectedRoute` & `RoleBasedRoute`
- **Material UI v5 (MUI)** + **Bootstrap 5** for modern UI/UX with glassmorphism & responsive layouts
- **Axios** with JWT request & response interceptors
- **Socket.IO Client** for real-time live messaging and typing indicators
- **React-Toastify** for interactive notifications

### Backend (`server/`)
- **Node.js** & **Express.js** (Strict MVC pattern)
- **MongoDB** & **Mongoose** (ODM with indexing and population)
- **JSON Web Tokens (JWT)** & **bcryptjs** password hashing
- **Socket.IO** server engine for real-time collaboration rooms
- **Multer** for secure file uploads (portfolio items, project deliverables)
- **CORS**, **dotenv**

---

## 3. Pre-Seeded Demo Credentials

To make evaluation immediate and effortless, 1-Click Demo Login buttons are available on the login page:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@sbworks.com` | `admin123` |
| **Client** | `client@sbworks.com` | `client123` |
| **Freelancer** | `freelancer@sbworks.com` | `freelancer123` |

---

## 4. Key Features & Workflows

1. **Role-Based Authentication & Navigation**:
   - Distinct views and permissions for `client`, `freelancer`, and `admin`.
   - Protected routes rejecting unauthenticated requests.
2. **Client Project Lifecycle**:
   - Post projects with title, description, skills required, budget, and deadline.
   - Review incoming bids from freelancers with their pitch and proposed rates.
   - **Single-Approval Rule**: Accepting one bid automatically assigns the project, transitions status to `In Progress`, rejects other bids, and unlocks the chat room.
   - Inspect submitted deliverables and mark as `Completed` to credit freelancer funds.
   - Leave a 5-star rating and written review.
3. **Freelancer Workflow**:
   - Search & filter projects by skills, budget slider, and status.
   - Submit proposal bids with customized cover letter and pricing.
   - Track application statuses (`Pending`, `Accepted`, `Rejected`).
   - Chat in real-time with clients on approved projects.
   - Submit deliverables (code repository links, setup manuals, notes, and file attachments).
   - Manage profile, skills tags, portfolio links, and view wallet funds.
4. **Socket.IO Real-Time Chat**:
   - Room-based real-time communication (`project_${projectId}`).
   - Instant message dispatch, typing indicators, and message persistence.
5. **Admin Hub**:
   - Platform KPI statistics (Total Users, Active Projects, Platform Volume, Applications).
   - User moderation (verify users, ban/unban, delete).
   - Platform-wide project governance & dispute resolution.

---

## 5. API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user & return JWT
- `GET /api/auth/me` — Get current logged-in user

### Projects
- `POST /api/projects` — Create project (Client only)
- `GET /api/projects` — Filter/search projects
- `GET /api/projects/:id` — Get single project details
- `GET /api/projects/user/my-projects` — Get user's projects
- `PUT /api/projects/:id` — Update project (Client only)
- `DELETE /api/projects/:id` — Delete project
- `PUT /api/projects/:id/submit` — Submit deliverables (Freelancer only)
- `PUT /api/projects/:id/complete` — Complete project & release funds (Client only)

### Applications / Bids
- `POST /api/applications` — Submit proposal (Freelancer only)
- `GET /api/applications/my` — Get freelancer's applications
- `GET /api/applications/project/:projectId` — Get project bids
- `PUT /api/applications/:id/approve` — Approve proposal (Client only)
- `PUT /api/applications/:id/reject` — Reject proposal (Client only)

### Chat & Collaboration
- `GET /api/chat/:projectId` — Get project chat history
- `POST /api/chat/:projectId/message` — Send message

### Reviews
- `POST /api/reviews` — Submit review & rating
- `GET /api/reviews/user/:userId` — Get reviews for user

### Admin
- `GET /api/admin/stats` — Platform metrics
- `GET /api/admin/users` — List all users
- `PUT /api/admin/users/:id/verify` — Toggle user verification
- `PUT /api/admin/users/:id/ban` — Toggle user ban
- `GET /api/admin/projects` — Platform projects list
- `GET /api/admin/applications` — Platform applications list
- `PUT /api/admin/disputes/:id` — Resolve dispute

---

## 6. How to Run Locally

### 1. Backend Setup
```bash
cd server
npm install
npm run seed      # Populates demo users, projects, bids, and reviews
npm run dev       # Starts Express + Socket.IO server on http://localhost:6001
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev       # Starts Vite React dev server on http://localhost:5173
```

Open `http://localhost:5173` in your browser.
