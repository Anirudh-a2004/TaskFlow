import bcrypt from 'bcryptjs';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { notFound } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pagination, searchFilter } from '../utils/query.js';
import { recalcProjectProgress } from './projectController.js';

function action(req, payload) {
  return Activity.create({ actor: req.user._id, ip: req.ip, ...payload });
}

export const adminOverview = asyncHandler(async (req, res) => {
  const [users, activeProjects, archivedProjects, tasks, activities] = await Promise.all([
    User.find().select('-password'),
    Project.find({ archived: false }).populate('manager owner members', 'name email role status'),
    Project.find({ archived: true }),
    Task.find().populate('project', 'name').populate('assignee', 'name email avatar'),
    Activity.find().populate('actor', 'name email role').populate('project', 'name').populate('task', 'title').sort({ createdAt: -1 }).limit(20)
  ]);

  const now = new Date();
  const completed = tasks.filter((task) => task.status === 'Completed');
  const overdue = tasks.filter((task) => task.dueDate && task.dueDate < now && task.status !== 'Completed');
  const completedProjects = activeProjects.filter((project) => project.status === 'Completed');
  const memberStats = users.map((user) => {
    const assigned = tasks.filter((task) => task.assignee?._id?.equals(user._id));
    const done = assigned.filter((task) => task.status === 'Completed').length;
    const completionRate = assigned.length ? Math.round((done / assigned.length) * 100) : 0;
    return {
      user,
      assigned: assigned.length,
      completed: done,
      completionRate,
      productivityScore: Math.min(100, completionRate + done * 8 + assigned.length * 2)
    };
  }).sort((a, b) => b.productivityScore - a.productivityScore);

  res.json({
    cards: {
      totalUsers: users.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      archivedProjects: archivedProjects.length,
      completedTasks: completed.length,
      overdueTasks: overdue.length,
      blockedUsers: users.filter((user) => user.status !== 'Active').length
    },
    taskStatus: ['Todo', 'In Progress', 'Review', 'Completed'].map((status) => ({ name: status, value: tasks.filter((task) => task.status === status).length })),
    productivity: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
      day,
      completed: completed.filter((task) => task.updatedAt.getDay() === index).length,
      overdue: overdue.filter((task) => task.dueDate.getDay() === index).length
    })),
    memberStats,
    activities,
    alerts: [
      ...overdue.slice(0, 5).map((task) => ({ type: 'overdue', title: task.title, message: `${task.title} is overdue.` })),
      ...activeProjects.filter((project) => project.deadline && project.deadline < new Date(Date.now() + 1000 * 60 * 60 * 24 * 5)).slice(0, 5).map((project) => ({ type: 'deadline', title: project.name, message: `${project.name} deadline is near.` }))
    ]
  });
});

export const adminUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req);
  const filter = { ...searchFilter(['name', 'email', 'department', 'role', 'status'], req.query.search) };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.role) filter.role = req.query.role;
  const [items, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);
  res.json({ items, page, pages: Math.ceil(total / limit), total });
});

export const updateUserAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw notFound('User');
  const before = { role: user.role, status: user.status };
  for (const field of ['role', 'status', 'title', 'department', 'name']) {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  }
  await user.save();
  await action(req, { action: 'user.updated', detail: `${user.name} updated`, severity: user.status === 'Blocked' ? 'warning' : 'info', metadata: { before, after: { role: user.role, status: user.status } } });
  res.json({ user });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) throw notFound('User');
  user.password = req.body.password || 'password123';
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();
  await action(req, { action: 'user.password_reset', detail: `Password reset for ${user.email}`, severity: 'warning' });
  res.json({ message: 'Password reset complete.' });
});

export const userActivity = asyncHandler(async (req, res) => {
  const items = await Activity.find({ actor: req.params.id }).populate('actor', 'name email').populate('project', 'name').populate('task', 'title').sort({ createdAt: -1 }).limit(100);
  res.json({ items });
});

export const adminProjects = asyncHandler(async (req, res) => {
  const filter = { ...searchFilter(['name', 'description', 'priority'], req.query.search) };
  if (req.query.archived === 'true') filter.archived = true;
  if (req.query.archived === 'false') filter.archived = false;
  const items = await Project.find(filter).populate('owner manager members', 'name email role status').sort({ updatedAt: -1 });
  res.json({ items, total: items.length });
});

export const updateProjectAdmin = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('owner manager members', 'name email role status');
  if (!project) throw notFound('Project');
  await action(req, { action: 'project.updated', project: project._id, detail: project.name });
  res.json({ project });
});

export const archiveProject = asyncHandler(async (req, res) => {
  const archived = req.body.archived !== false;
  const project = await Project.findById(req.params.id);
  if (!project) throw notFound('Project');

  project.archived = archived;
  project.archivedAt = archived ? new Date() : undefined;
  if (archived) {
    project.status = 'Archived';
    project.completedAt = undefined;
  } else {
    await recalcProjectProgress(project._id);
  }

  await project.save();
  await action(req, { action: archived ? 'project.archived' : 'project.restored', project: project._id, detail: project.name, severity: archived ? 'warning' : 'info' });
  res.json({ project });
});

export const adminTasks = asyncHandler(async (req, res) => {
  const filter = { ...searchFilter(['title', 'description', 'labels'], req.query.search) };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  const items = await Task.find(filter).populate('project', 'name priority').populate('assignee createdBy', 'name email avatar status').sort({ updatedAt: -1 });
  res.json({ items, total: items.length });
});

export const bulkTaskUpdate = asyncHandler(async (req, res) => {
  const ids = req.body.ids || [];
  const patch = {};
  for (const field of ['status', 'priority', 'assignee', 'dueDate']) {
    if (req.body[field] !== undefined) patch[field] = req.body[field] || undefined;
  }
  await Task.updateMany({ _id: { $in: ids } }, patch);
  await action(req, { action: 'task.bulk_updated', detail: `${ids.length} tasks updated`, severity: req.body.priority === 'Urgent' ? 'warning' : 'info', metadata: patch });
  res.json({ message: `${ids.length} tasks updated.` });
});

export const auditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req);
  const filter = {};
  if (req.query.action) filter.action = { $regex: req.query.action, $options: 'i' };
  const [items, total] = await Promise.all([
    Activity.find(filter).populate('actor', 'name email role').populate('project', 'name').populate('task', 'title').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Activity.countDocuments(filter)
  ]);
  res.json({ items, page, pages: Math.ceil(total / limit), total });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const users = await User.find({ status: 'Active' }).select('_id');
  const docs = users.map((user) => ({
    user: user._id,
    type: 'system',
    title: req.body.title,
    message: req.body.message,
    link: '/notifications'
  }));
  await Notification.insertMany(docs);
  await action(req, { action: 'announcement.created', detail: req.body.title });
  res.status(201).json({ message: 'Announcement sent.', count: docs.length });
});

export const backupData = asyncHandler(async (req, res) => {
  const [users, projects, tasks, activities, notifications] = await Promise.all([
    User.find().select('-password'),
    Project.find(),
    Task.find(),
    Activity.find(),
    Notification.find()
  ]);
  res.json({ exportedAt: new Date(), users, projects, tasks, activities, notifications });
});
