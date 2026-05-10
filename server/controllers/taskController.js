import Activity from '../models/Activity.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { ApiError, notFound } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pagination, searchFilter } from '../utils/query.js';
import { recalcProjectProgress } from './projectController.js';

async function ensureTaskAccess(task, user) {
  const project = await Project.findById(task.project);
  if (!project) throw notFound('Project');
  const isMember = project.members.some((id) => id.equals(user._id));
  const isLead = project.manager && project.manager.equals(user._id);
  if (user.role !== 'Admin' && !isMember && !isLead) {
    throw new ApiError(403, 'Task access denied.');
  }
  return project;
}

async function canAssignToProject(project, assigneeId) {
  if (!assigneeId) return true;
  if (project.members.some((id) => id.toString() === assigneeId)) return true;
  if (project.manager && project.manager.toString() === assigneeId) return true;
  const person = await User.findById(assigneeId).select('role');
  return person?.role === 'Admin';
}

export const listTasks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req);
  const projectAccess = req.user.role === 'Admin'
    ? {}
    : { $or: [{ members: req.user._id }, { manager: req.user._id }] };
  const projects = await Project.find(projectAccess).select('_id');
  const filter = {
    project: { $in: projects.map((project) => project._id) },
    ...searchFilter(['title', 'description', 'labels'], req.query.search)
  };
  if (req.query.project) filter.project = req.query.project;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.assignee === 'me') filter.assignee = req.user._id;

  const [items, total] = await Promise.all([
    Task.find(filter)
      .populate({
        path: 'project',
        select: 'name color manager members owner progress status archived deadline priority completedAt',
        populate: [
          { path: 'manager', select: 'name email avatar role' },
          { path: 'members', select: 'name email avatar role' },
          { path: 'owner', select: 'name email avatar role' }
        ]
      })
      .populate('assignee createdBy', 'name email avatar')
      .sort({ order: 1, dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter)
  ]);
  res.json({ items, page, pages: Math.ceil(total / limit), total });
});

export const createTask = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.body.project);
  if (!project) throw notFound('Project');
  const isLead = project.manager && project.manager.equals(req.user._id);
  if (req.user.role !== 'Admin' && !isLead) {
    throw new ApiError(403, 'You do not have permission to manage tasks for this project.');
  }
  if (!(await canAssignToProject(project, req.body.assignee))) {
    throw new ApiError(400, 'Assignee must be a project member, lead, or admin.');
  }

  const task = await Task.create({ ...req.body, createdBy: req.user._id });
  await recalcProjectProgress(task.project);
  await Activity.create({ actor: req.user._id, project: task.project, task: task._id, action: 'task.created', detail: task.title });
  if (task.assignee) {
    const notification = await Notification.create({
      user: task.assignee,
      type: 'assignment',
      title: 'New task assigned',
      message: `${req.user.name} assigned "${task.title}" to you.`,
      link: `/tasks/${task._id}`
    });
    req.io?.to(task.assignee.toString()).emit('notification', notification);
  }
  res.status(201).json({ task: await task.populate([
    {
      path: 'project',
      select: 'name color manager members owner progress status archived deadline priority completedAt',
      populate: [
        { path: 'manager', select: 'name email avatar role' },
        { path: 'members', select: 'name email avatar role' },
        { path: 'owner', select: 'name email avatar role' }
      ]
    },
    { path: 'assignee', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' }
  ]) });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw notFound('Task');
  const project = await ensureTaskAccess(task, req.user);
  const isLead = project.manager && project.manager.equals(req.user._id);
  if (req.user.role !== 'Admin' && !isLead && (!task.assignee || !task.assignee.equals(req.user._id))) {
    throw new ApiError(403, 'Members can edit only tasks assigned to them.');
  }
  if (req.body.assignee !== undefined && !(await canAssignToProject(project, req.body.assignee || undefined))) {
    throw new ApiError(400, 'Assignee must be a project member, lead, or admin.');
  }
  Object.assign(task, req.body);
  await task.save();
  await recalcProjectProgress(task.project);
  await Activity.create({ actor: req.user._id, project: task.project, task: task._id, action: 'task.updated', detail: task.title });
  res.json({ task: await task.populate([
    {
      path: 'project',
      select: 'name color manager members owner progress status archived deadline priority completedAt',
      populate: [
        { path: 'manager', select: 'name email avatar role' },
        { path: 'members', select: 'name email avatar role' },
        { path: 'owner', select: 'name email avatar role' }
      ]
    },
    { path: 'assignee', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' }
  ]) });
});

export const reorderTasks = asyncHandler(async (req, res) => {
  await Promise.all(
    req.body.tasks.map((item) => Task.findByIdAndUpdate(item.id, { status: item.status, order: item.order }))
  );
  res.json({ message: 'Board updated.' });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw notFound('Task');
  await recalcProjectProgress(task.project);
  await Activity.create({ actor: req.user._id, project: task.project, action: 'task.deleted', detail: task.title });
  res.json({ message: 'Task deleted.' });
});

export const addComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw notFound('Task');
  await ensureTaskAccess(task, req.user);
  const comment = await Comment.create({ task: task._id, author: req.user._id, body: req.body.body });
  await Activity.create({ actor: req.user._id, project: task.project, task: task._id, action: 'comment.added', detail: task.title });
  res.status(201).json({ comment: await comment.populate('author', 'name avatar') });
});

export const listComments = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw notFound('Task');
  await ensureTaskAccess(task, req.user);
  const comments = await Comment.find({ task: task._id }).populate('author', 'name avatar').sort({ createdAt: -1 });
  res.json({ items: comments });
});

export const addAttachment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw notFound('Task');
  await ensureTaskAccess(task, req.user);
  if (!req.file) throw new ApiError(400, 'File is required.');
  task.attachments.push({ name: req.file.originalname, url: `/uploads/${req.file.filename}`, size: req.file.size, type: req.file.mimetype });
  await task.save();
  res.status(201).json({ task });
});
