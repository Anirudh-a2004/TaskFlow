# TaskFlow – Team Task Manager SaaS

TaskFlow is a modern full-stack team collaboration and project management platform built to simplify how teams manage projects, tasks, deadlines, and productivity.

The project started as a simple task manager and gradually evolved into a complete SaaS-style productivity platform with authentication, role-based access control, Kanban workflows, dashboards, analytics, notifications, calendar planning, and responsive UI/UX improvements.

This project was built as part of a full-stack assessment and later expanded with additional enterprise-style workflow features and UI polishing.

---

# Live Demo

🌐 Live Application: *(Add your Railway deployed link here)*

📂 GitHub Repository: *(Add your GitHub repo link here)*

🎥 Demo Video: *(Add your demo video link here)*

---

# Features

## Authentication & Security

* User Signup & Login
* JWT-based Authentication
* Protected Routes
* Role-Based Access Control (RBAC)
* Admin / Project Lead / Member workflows

---

## Dashboard

* Productivity overview
* Task analytics
* Activity tracking
* Project insights
* Completion statistics
* Interactive charts and metrics

---

## Project Management

* Create and manage projects
* Assign Project Leads
* Track project progress
* Project completion workflow
* Active / Completed project handling
* Project detail views with related tasks

---

## Task Management

* Kanban workflow board
* Drag-and-drop task movement
* Task priority system
* Task assignment system
* Review & completion workflow
* Permission-based task completion

---

## Team Collaboration

* Invite team members
* Role management
* Member assignment workflows
* Team visibility and collaboration

---

## Notifications System

* Real-time notification updates
* Unread notification counters
* Mark as read / mark all as read
* Interactive notification actions

---

## Calendar & Planner

* Weekly and monthly planning
* Task scheduling
* Deadline tracking
* Responsive planner UI

---

## UI / UX Features

* Premium SaaS-inspired design
* Dark & Light mode support
* Glassmorphism UI styling
* Responsive mobile/tablet layouts
* Smooth animations and transitions
* Professional landing page

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* React Router DOM
* Framer Motion
* Recharts
* Socket.IO Client

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.IO

## Deployment

* Railway

---

# Folder Structure

```bash
client/
 ├── src/
 │    ├── components/
 │    ├── context/
 │    ├── pages/
 │    ├── styles/
 │    └── main.jsx

server/
 ├── config/
 ├── middleware/
 ├── models/
 ├── routes/
 ├── controllers/
 └── index.js
```

---

# Installation & Setup

## Clone Repository

```bash
git clone <your-github-repo-link>
cd PROJCET_TASK
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file in the root directory.

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

---

## Run Development Server

```bash
npm run dev
```

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:3000
```

---

# Deployment

The project is deployed using Railway.

Build process:

```bash
npm run build
npm run start
```

---

# Roles & Permissions

## Admin

* Create projects
* Assign Project Leads
* Manage users
* Access admin dashboard
* View analytics

## Project Lead

* Manage assigned projects
* Assign tasks
* Invite/manage project members
* Approve completed tasks/projects

## Member

* View assigned projects
* Update task progress
* Collaborate within projects

---

# Workflow Overview

1. Admin creates a project
2. Admin assigns a Project Lead
3. Project Lead manages tasks and members
4. Team members work on assigned tasks
5. Tasks move through:

```txt
Todo → In Progress → Review → Completed
```

6. Project Lead/Admin approves project completion

---

# Screenshots

*(Add screenshots here later)*

Suggested screenshots:

* Landing Page
* Dashboard
* Kanban Board
* Projects Page
* Calendar Planner
* Admin Console
* Mobile View

---

# Challenges Faced

Some of the major challenges while building TaskFlow:

* Managing complex route structures
* Implementing RBAC workflows
* Handling responsive Kanban layouts
* Synchronizing notifications globally
* Designing consistent dark/light themes
* Stabilizing sidebar and planner responsiveness
* Maintaining scalable UI architecture

These challenges helped improve understanding of real-world SaaS application development.

---

# Future Improvements

Possible future upgrades:

* Google OAuth Authentication
* Email Verification
* Real-time team chat
* File attachments
* AI productivity insights
* Advanced analytics
* Multi-workspace support
* Project templates

---

# Author

Anirudh A

📧 [anirudhhfhs2017@gmail.com](mailto:anirudhhfhs2017@gmail.com)

Final Year CSE (IoT & CSBT)

Passionate about:

* Full-Stack Development
* SaaS Applications
* UI/UX Engineering
* Cyber Security
* Scalable Web Systems

---

# Final Note

TaskFlow started as an assessment project but gradually evolved into a complete SaaS-style productivity platform.

This project helped strengthen practical understanding of:

* Full-stack architecture
* Role-based systems
* Real-world UI/UX workflows
* API integration
* Deployment pipelines
* Responsive SaaS development

The goal was not just to build features, but to create an application that feels professional, scalable, and realistic.
