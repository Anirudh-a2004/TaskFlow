import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Activity from '../models/Activity.js';
import ChatMessage from '../models/ChatMessage.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

await connectDB();

await Promise.all([
  User.deleteMany({}),
  Project.deleteMany({}),
  Task.deleteMany({}),
  Comment.deleteMany({}),
  Notification.deleteMany({}),
  Activity.deleteMany({}),
  ChatMessage.deleteMany({})
]);

const [admin, designer, engineer, qa] = await User.create([
  { name: 'Aarav Sharma', email: 'admin@taskflow.dev', password: 'password123', role: 'Admin', title: 'Product Lead', department: 'Product' },
  { name: 'Maya Iyer', email: 'maya@taskflow.dev', password: 'password123', role: 'Member', title: 'UX Designer', department: 'Design' },
  { name: 'Kabir Mehta', email: 'kabir@taskflow.dev', password: 'password123', role: 'Member', title: 'Full-stack Engineer', department: 'Engineering' },
  { name: 'Nisha Rao', email: 'nisha@taskflow.dev', password: 'password123', role: 'Member', title: 'QA Analyst', department: 'Quality' }
]);

const projects = await Project.create([
  {
    name: 'Website Redesign',
    description: 'Modern SaaS refresh for acquisition pages and onboarding.',
    owner: admin._id,
    members: [admin._id, designer._id, engineer._id],
    priority: 'High',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
    color: '#2563eb',
    progress: 52
  },
  {
    name: 'Mobile App Launch',
    description: 'Ship the first mobile MVP with task updates and notifications.',
    owner: admin._id,
    members: [admin._id, engineer._id, qa._id],
    priority: 'Urgent',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9),
    color: '#0f766e',
    progress: 35
  },
  {
    name: 'Customer Success Portal',
    description: 'Support dashboard, account health, and team chat workflows.',
    owner: admin._id,
    members: [admin._id, designer._id, qa._id],
    priority: 'Medium',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
    color: '#d97706',
    progress: 74
  }
]);

const [website, mobile, portal] = projects;

const tasks = await Task.create([
  { title: 'Audit current design system', description: 'Map tokens, duplicated components, and accessibility gaps.', project: website._id, assignee: designer._id, createdBy: admin._id, status: 'Completed', priority: 'High', dueDate: new Date(Date.now() - 86400000), labels: ['design', 'audit'], subtasks: [{ title: 'Collect components', completed: true }, { title: 'Write recommendations', completed: true }] },
  { title: 'Build animated landing hero', description: 'Responsive hero with motion, trust proof, and conversion CTA.', project: website._id, assignee: engineer._id, createdBy: admin._id, status: 'In Progress', priority: 'High', dueDate: new Date(Date.now() + 86400000 * 4), labels: ['frontend'] },
  { title: 'Prepare app store checklist', description: 'Track screenshots, privacy labels, and release notes.', project: mobile._id, assignee: qa._id, createdBy: admin._id, status: 'Todo', priority: 'Urgent', dueDate: new Date(Date.now() + 86400000 * 2), labels: ['release'] },
  { title: 'Implement push notifications', description: 'Real-time assignment and deadline reminders.', project: mobile._id, assignee: engineer._id, createdBy: admin._id, status: 'Review', priority: 'Urgent', dueDate: new Date(Date.now() + 86400000 * 6), labels: ['backend', 'realtime'] },
  { title: 'Design support inbox flow', description: 'Ticket detail page, SLA badges, and team notes.', project: portal._id, assignee: designer._id, createdBy: admin._id, status: 'In Progress', priority: 'Medium', dueDate: new Date(Date.now() + 86400000 * 12), labels: ['ux'] },
  { title: 'Regression suite for portal', description: 'Smoke tests for chat, notifications, and exports.', project: portal._id, assignee: qa._id, createdBy: admin._id, status: 'Todo', priority: 'Medium', dueDate: new Date(Date.now() + 86400000 * 16), labels: ['qa'] }
]);

await Comment.create([
  { task: tasks[1]._id, author: designer._id, body: 'Hero spacing looks good on desktop. Need one more pass on mobile cards.' },
  { task: tasks[3]._id, author: qa._id, body: 'Reviewing deadline reminder edge cases before approval.' }
]);

await Notification.create([
  { user: engineer._id, type: 'assignment', title: 'Task assigned', message: 'You were assigned Build animated landing hero.', link: `/tasks/${tasks[1]._id}` },
  { user: qa._id, type: 'deadline', title: 'Deadline approaching', message: 'Prepare app store checklist is due soon.', link: `/tasks/${tasks[2]._id}` }
]);

await Activity.create(tasks.map((task) => ({
  actor: admin._id,
  project: task.project,
  task: task._id,
  action: 'task.created',
  detail: task.title
})));

await ChatMessage.create([
  { project: website._id, sender: admin._id, message: 'Let us keep the redesign scope focused on activation and clarity.' },
  { project: website._id, sender: designer._id, message: 'I will post updated components after the design audit.' }
]);

console.log('Seeded sample data.');
console.log('Admin login: admin@taskflow.dev / password123');
await mongoose.disconnect();
