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
  await Project.findByIdAndUpdate(projectId, { progress });
  return progress;
}

export const listProjects = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req);
  const access = req.user.role === 'Admin' ? {} : { members: req.user._id };
  const filter = { ...access, ...searchFilter(['name', 'description', 'priority'], req.query.search) };
  if (req.query.priority) filter.priority = req.query.priority;
  const [items, total] = await Promise.all([
    Project.find(filter).populate('owner members', 'name email avatar role').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Project.countDocuments(filter)
  ]);
  res.json({ items, page, pages: Math.ceil(total / limit), total });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('owner members', 'name email avatar role');
  if (!project) throw notFound('Project');
  if (req.user.role !== 'Admin' && !project.members.some((member) => member._id.equals(req.user._id))) {
    throw new ApiError(403, 'Project access denied.');
  }
  res.json({ project });
});

export const createProject = asyncHandler(async (req, res) => {
  const members = Array.from(new Set([req.user._id.toString(), ...(req.body.members || [])]));
  const project = await Project.create({ ...req.body, owner: req.user._id, members });
  await Activity.create({ actor: req.user._id, project: project._id, action: 'project.created', detail: project.name });
  res.status(201).json({ project: await project.populate('owner members', 'name email avatar role') });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('owner members', 'name email avatar role');
  if (!project) throw notFound('Project');
  await Activity.create({ actor: req.user._id, project: project._id, action: 'project.updated', detail: project.name });
  res.json({ project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw notFound('Project');
  await Task.deleteMany({ project: project._id });
  await Activity.create({ actor: req.user._id, action: 'project.deleted', detail: project.name });
  res.json({ message: 'Project deleted.' });
});

export { recalcProjectProgress };
