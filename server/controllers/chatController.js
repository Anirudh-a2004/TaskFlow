import ChatMessage from '../models/ChatMessage.js';
import Project from '../models/Project.js';
import { ApiError, notFound } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function ensureProjectAccess(projectId, user) {
  const project = await Project.findById(projectId);
  if (!project) throw notFound('Project');
  if (user.role !== 'Admin' && !project.members.some((id) => id.equals(user._id))) {
    throw new ApiError(403, 'Chat access denied.');
  }
  return project;
}

export const listMessages = asyncHandler(async (req, res) => {
  await ensureProjectAccess(req.params.projectId, req.user);
  const items = await ChatMessage.find({ project: req.params.projectId }).populate('sender', 'name avatar').sort({ createdAt: -1 }).limit(50);
  res.json({ items: items.reverse() });
});

export const sendMessage = asyncHandler(async (req, res) => {
  await ensureProjectAccess(req.params.projectId, req.user);
  const message = await ChatMessage.create({ project: req.params.projectId, sender: req.user._id, message: req.body.message });
  const populated = await message.populate('sender', 'name avatar');
  req.io?.to(req.params.projectId).emit('chat:message', populated);
  res.status(201).json({ message: populated });
});
