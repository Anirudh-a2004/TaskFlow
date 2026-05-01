import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir);

const db = new DatabaseSync(
  path.join(dataDir, 'task-manager.sqlite')
);

const app = express();

const PORT = process.env.PORT || 3000;

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'dev-secret-change-before-production';

app.use(cors());
app.use(express.json());

/* =========================================
   UPDATED FOR RAILWAY + REACT BUILD
========================================= */
app.use(
  express.static(
    path.join(__dirname, '../client/dist')
  )
);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (
      role IN ('ADMIN', 'MEMBER')
    ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    owner_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS project_members (
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id)
      REFERENCES projects(id)
      ON DELETE CASCADE,
    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    assignee_id INTEGER,
    status TEXT NOT NULL CHECK (
      status IN ('TODO', 'IN_PROGRESS', 'DONE')
    ) DEFAULT 'TODO',
    priority TEXT NOT NULL CHECK (
      priority IN ('LOW', 'MEDIUM', 'HIGH')
    ) DEFAULT 'MEDIUM',
    due_date TEXT,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id)
      REFERENCES projects(id)
      ON DELETE CASCADE,

    FOREIGN KEY (assignee_id)
      REFERENCES users(id)
      ON DELETE SET NULL,

    FOREIGN KEY (created_by)
      REFERENCES users(id)
      ON DELETE CASCADE
  );
`);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

/* =========================================
   YOUR EXISTING ROUTES STAY HERE
========================================= */







/* =========================================
   ERROR HANDLER
========================================= */
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    error: err.status
      ? err.message
      : 'Something went wrong.'
  });
});

/* =========================================
   REACT ROUTER SUPPORT
========================================= */
app.get('*', (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      '../client/dist/index.html'
    )
  );
});

/* =========================================
   UPDATED FOR RAILWAY
========================================= */
app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Team Task Manager running at http://localhost:${PORT}`
  );
});