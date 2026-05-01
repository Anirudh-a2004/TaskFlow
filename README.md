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

```bash
npm install
```

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

```bash
npm run dev
```

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
