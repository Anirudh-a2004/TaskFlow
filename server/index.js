import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';

import { connectDB } from './config/db.js';

import {
  errorMiddleware,
  notFoundMiddleware
} from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();

const server = http.createServer(app);

const allowedOrigin =
  process.env.CLIENT_URL ||
  'http://localhost:5173';

const devOrigin =
  process.env.NODE_ENV !== 'production';

const io = new Server(server, {
  cors: {
    origin: devOrigin ? true : allowedOrigin,
    credentials: true
  }
});

console.log(
  `Server starting in ${
    process.env.NODE_ENV || 'development'
  } mode`
);

console.log(
  `Using API client origin: ${
    devOrigin
      ? 'any local dev origin'
      : allowedOrigin
  }`
);

app.set('trust proxy', 1);

const corsOptions = {
  origin: devOrigin ? true : allowedOrigin,
  credentials: true,
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
};

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(cors(corsOptions));

app.use(
  express.json({
    limit: '5mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '5mb'
  })
);

app.use(morgan('dev'));

app.use(
  '/uploads',
  express.static(
    path.resolve(
      process.env.UPLOAD_DIR || 'uploads'
    )
  )
);

app.use((req, res, next) => {
  req.io = io;
  next();
});

/* =========================================
   API ROUTES
========================================= */

app.get('/api/health', (req, res) =>
  res.json({
    ok: true,
    service: 'team-task-manager'
  })
);

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

/* =========================================
   SERVE FRONTEND
========================================= */

app.use(
  express.static(
    path.resolve(__dirname, '../dist')
  )
);

/* =========================================
   REACT ROUTER FIX FOR EXPRESS 5
========================================= */

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(
    path.resolve(
      __dirname,
      '../dist/index.html'
    )
  );
});

/* =========================================
   SOCKET.IO
========================================= */

io.on('connection', (socket) => {
  socket.on('join:user', (userId) =>
    socket.join(userId)
  );

  socket.on('join:project', (projectId) =>
    socket.join(projectId)
  );
});

/* =========================================
   ERROR HANDLERS
========================================= */

app.use(notFoundMiddleware);

app.use(errorMiddleware);

/* =========================================
   START SERVER
========================================= */

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() =>
    server.listen(
      PORT,
      '0.0.0.0',
      () =>
        console.log(
          `API running at http://localhost:${PORT}`
        )
    )
  )
  .catch((error) => {
    console.error(
      'MongoDB connection failed:',
      error.message
    );

    process.exit(1);
  });