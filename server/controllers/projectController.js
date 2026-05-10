import Activity from '../models/Activity.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { ApiError, notFound } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pagination, searchFilter } from '../utils/query.js';

async function recalcProjectProgress(projectId) {
  const [total, done] = await Promise.all([
    Task.countDocuments({ project: projectId }),
    Task.countDocuments({ project: projectId, status: 'Completed' })
  ]);
  const progress = total ? Math.round((done / total) * 100) : 0;
  const project = await Project.findById(projectId);
  if (!project) return progress;

  const previousStatus = project.status || 'Active';

  project.progress = progress;
  if (project.archived) {
    project.status = 'Archived';
    project.completedAt = undefined;
    project.completionReadyAt = undefined;
  } else if (total > 0 && done === total) {
    // Manual completion approval: reaching 100% means "ready", not auto-completed.
    // The project lead (manager) must approve completion explicitly.
    project.completionReadyAt = project.completionReadyAt || new Date();
    if (project.status === 'Completed') {
      project.completedAt = project.completedAt || new Date();
    } else {
      project.status = 'In Progress';
      project.completedAt = undefined;
    }
  } else if (done > 0 || progress > 0) {
    project.status = 'In Progress';
    project.completedAt = undefined;
    project.completionReadyAt = undefined;
  } else {
    project.status = 'Active';
    project.completedAt = undefined;
    project.completionReadyAt = undefined;
  }

  await project.save();

  if (previousStatus !== 'Completed' && project.status === 'Completed') {
    await Activity.create({
      project: project._id,
      action: 'project.completed',
      detail: project.name,
      severity: 'info',
      metadata: { totalTasks: total }
    });
  }

  return { progress, status: project.status, completedAt: project.completedAt, completionReadyAt: project.completionReadyAt };
}

export const listProjects = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req);
  const access = req.user.role === 'Admin' ? {} : { members: req.user._id };
  const filter = { ...access, ...searchFilter(['name', 'description', 'priority'], req.query.search) };
  if (req.query.priority) filter.priority = req.query.priority;
  const [items, total] = await Promise.all([
    Project.find(filter).populate('owner manager members', 'name email avatar role').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Project.countDocuments(filter)
  ]);
  res.json({ items, page, pages: Math.ceil(total / limit), total });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('owner manager members', 'name email avatar role');
  if (!project) throw notFound('Project');
  if (req.user.role !== 'Admin' && !project.members.some((member) => member._id.equals(req.user._id))) {
    throw new ApiError(403, 'Project access denied.');
  }
  res.json({ project });
});

export const createProject = asyncHandler(async (req, res) => {
  const managerId = req.body.manager;
  const seed = [req.user._id.toString(), ...(req.body.members || [])];
  if (managerId) seed.push(managerId);
  const members = Array.from(new Set(seed));
  const project = await Project.create({ ...req.body, owner: req.user._id, members, status: 'Active' });
  await Activity.create({ actor: req.user._id, project: project._id, action: 'project.created', detail: project.name });
  res.status(201).json({ project: await project.populate('owner members', 'name email avatar role') });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw notFound('Project');

  const isLead = project.manager && project.manager.equals(req.user._id);
  const isAdmin = req.user.role === 'Admin';

  if (!isAdmin && !isLead) {
    throw new ApiError(403, 'Only admins or the project lead can update this project.');
  }

  const allowedForLead = new Set(['members']);
  const allowedForAdmin = new Set(['name', 'description', 'priority', 'deadline', 'members', 'manager', 'archived', 'status', 'color']);

  const allowed = isAdmin ? allowedForAdmin : allowedForLead;
  const patch = {};
  for (const key of Object.keys(req.body || {})) {
    if (!allowed.has(key)) continue;
    patch[key] = req.body[key];
  }

  if (!isAdmin && patch.members === undefined) {
    throw new ApiError(400, 'No updatable fields provided.');
  }

  if (patch.members) {
    const nextMembers = Array.from(new Set([...(patch.members || []).map((id) => id?.toString()).filter(Boolean)]));
    if (!nextMembers.length) {
      throw new ApiError(400, 'Members list cannot be empty.');
    }
    // Ensure owner + lead remain members
    nextMembers.push(project.owner.toString());
    if (project.manager) nextMembers.push(project.manager.toString());
    project.members = Array.from(new Set(nextMembers));
  }

  if (isAdmin) {
    for (const key of ['name', 'description', 'priority', 'deadline', 'manager', 'archived', 'status', 'color']) {
      if (patch[key] !== undefined) project[key] = patch[key];
    }
  }

  await project.save();
  const populated = await project.populate('owner manager members', 'name email avatar role');
  await Activity.create({ actor: req.user._id, project: project._id, action: 'project.updated', detail: project.name });
  res.json({ project: populated });
});

export const approveProjectCompletion = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw notFound('Project');
  if (project.archived) throw new ApiError(400, 'Archived projects cannot be completed.');

  const isLead = project.manager && project.manager.equals(req.user._id);
  if (req.user.role !== 'Admin' && !isLead) {
    throw new ApiError(403, 'Only the project lead can approve completion.');
  }

  if (project.progress !== 100) {
    throw new ApiError(400, 'Project is not ready to complete.');
  }

  project.status = 'Completed';
  project.completedAt = project.completedAt || new Date();
  project.completionReadyAt = project.completionReadyAt || new Date();
  await project.save();

  await Activity.create({
    actor: req.user._id,
    project: project._id,
    action: 'project.completed',
    detail: project.name,
    severity: 'info'
  });

  res.json({ project: await project.populate('owner manager members', 'name email avatar role') });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw notFound('Project');
  await Task.deleteMany({ project: project._id });
  await Activity.create({ actor: req.user._id, action: 'project.deleted', detail: project.name });
  res.json({ message: 'Project deleted.' });
});

export { recalcProjectProgress };
