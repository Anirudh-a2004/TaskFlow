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

```bash
npm install
```

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

```bash
npm run dev
```

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
