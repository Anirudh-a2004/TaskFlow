<<<<<<< HEAD
# TaskFlow - Modern Team Task Manager

A full-stack SaaS-style Team Task Manager inspired by Notion, Trello, ClickUp, and Jira.

## Tech Stack

- Frontend: React, Tailwind CSS, Framer Motion, Context API
- Backend: Node.js, Express.js, Socket.IO
- Database: MongoDB with Mongoose
- Authentication: JWT + bcrypt password hashing
- UI: responsive layout, dark mode, charts, Kanban drag-and-drop, toast notifications

## Features

- Signup, login, forgot password, protected routes
- Role-based access: Admin and Member
- Admin project/user/task management
- Member access limited to assigned projects/tasks
- Project progress, deadlines, priorities, members
- Kanban board with Todo, In Progress, Review, Completed
- Task due dates, comments, attachments, priority, subtasks schema
- Dashboard cards, charts, productivity analytics, calendar, activity feed
- Real-time notification and chat infrastructure with Socket.IO
- Search, filtering, pagination-ready APIs
- Profile management and PDF report export
- Clean MVC backend folder structure

## Setup

1. Install dependencies:
=======
TaskFlow is a modern full-stack Team Task Manager web application built using the MERN stack. It helps teams manage projects, assign tasks, track progress, collaborate efficiently, and monitor productivity through a beautiful SaaS-style dashboard.

---

# Features

##  Authentication & Security

* JWT Authentication
* Role-Based Access Control (Admin / Member)
* Protected Routes
* Password Hashing with bcrypt
* Secure REST APIs

## Team & Project Management

* Create and manage projects
* Add/remove team members
* Admin dashboard controls
* Project analytics

## Task Management

* Create/Edit/Delete tasks
* Assign tasks to members
* Task priorities
* Due dates
* Kanban drag-and-drop board
* Task status tracking

## Dashboard & Analytics

* Productivity analytics
* Task statistics
* Overdue task tracking
* Project progress monitoring
* Interactive charts

##  Real-Time Features

* Socket.io notifications
* Real-time updates
* Team collaboration features

##  Modern UI/UX

* Responsive design
* Dark mode
* Glassmorphism UI
* Smooth animations
* SaaS-inspired interface

---

#  Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Framer Motion
* Recharts

## Backend

* Node.js
* Express.js
* MongoDB
* Socket.io

## Authentication

* JWT
* bcryptjs

---

#  Project Structure

```txt
TaskFlow/
│
├── client/
├── server/
├── dist/
├── uploads/
└── package.json
```

---

#  Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

---

## Install Dependencies
>>>>>>> e938ea9dc67a4d816d2cb80b2a9482d055b2883c

```bash
npm install
```

<<<<<<< HEAD
2. Create environment file:

```bash
copy .env.example .env
```

3. Start MongoDB locally, or update `MONGODB_URI` in `.env`.

Default:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/team-task-manager
```

4. Seed dummy sample data:

```bash
npm run seed
```

Seed login:

```text
admin@taskflow.dev
password123
```

5. Run the app:
=======
---

## Setup Environment Variables

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
ADMIN_INVITE_CODE=TF-ADMIN-2026
NODE_ENV=development
```

---

#  Run Development Server
>>>>>>> e938ea9dc67a4d816d2cb80b2a9482d055b2883c

```bash
npm run dev
```

<<<<<<< HEAD
Frontend: `http://localhost:5173`  
Backend API: `http://localhost:3000`

## API Routes

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

Users:

- `GET /api/users`
- `PATCH /api/users/profile`
- `PATCH /api/users/:id/role`

Projects:

- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/reorder`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/tasks/:id/comments`
- `POST /api/tasks/:id/comments`
- `POST /api/tasks/:id/attachments`

Dashboard, notifications, chat:

- `GET /api/dashboard`
- `GET /api/notifications`
- `PATCH /api/notifications/read`
- `GET /api/chat/:projectId/messages`
- `POST /api/chat/:projectId/messages`

## Notes

- The first registered user becomes `Admin`; later signups become `Member`.
- SMTP variables are optional. Without them, emails are logged to the server console.
- Uploads are stored in the `uploads/` folder.
=======
---

#  Production Build

```bash
npm run build
npm start
```

---

# Deployment

Deployed on:

* Railway
* MongoDB Atlas

---

#  Demo Credentials

## Admin

```txt
Email: admin@taskflow.com
Password: 123456
```

## Member

```txt
Email: member@taskflow.com
Password: 123456
```

---

# 📸 Screenshots


---

#  Future Improvements

* AI task summaries
* Calendar integration
* Email notifications
* Team chat improvements
* Export reports as PDF
* Activity logs

---

#  License

This project is built for educational and portfolio purposes.

---

#  Author\
  Anirudh A
  anirudhhfhs2017@gmai.com

Developed by Anirudh
>>>>>>> e938ea9dc67a4d816d2cb80b2a9482d055b2883c
