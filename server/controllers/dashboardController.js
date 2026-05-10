import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboard = asyncHandler(async (req, res) => {
  const access = req.user.role === 'Admin' ? {} : { members: req.user._id };
  const projects = await Project.find(access).select('_id name progress deadline priority status archived');
  const projectIds = projects.map((project) => project._id);
  const tasks = await Task.find({ project: { $in: projectIds } }).populate('project', 'name').populate('assignee', 'name avatar');
  const today = new Date();
  const overdue = tasks.filter((task) => task.dueDate && task.dueDate < today && task.status !== 'Completed');
  const completed = tasks.filter((task) => task.status === 'Completed');
  const pending = tasks.filter((task) => task.status !== 'Completed');
  const statusCounts = ['Todo', 'In Progress', 'Review', 'Completed'].map((status) => ({
    name: status,
    value: tasks.filter((task) => task.status === status).length
  }));
  const productivity = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      completed: completed.filter((task) => task.updatedAt.toISOString().slice(0, 10) === key).length,
      created: tasks.filter((task) => task.createdAt.toISOString().slice(0, 10) === key).length
    };
  });
  const [recentActivity, notifications] = await Promise.all([
    Activity.find({ $or: [{ project: { $in: projectIds } }, { actor: req.user._id }] }).populate('actor', 'name avatar').sort({ createdAt: -1 }).limit(8),
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(8)
  ]);

  const completedProjects = projects.filter((project) => !project.archived && project.status === 'Completed');

  res.json({
    cards: {
      projects: projects.length,
      completedProjects: completedProjects.length,
      completed: completed.length,
      pending: pending.length,
      overdue: overdue.length
    },
    statusCounts,
    productivity,
    recentActivity,
    notifications,
    calendar: tasks.filter((task) => task.dueDate).map((task) => ({
      id: task._id,
      title: task.title,
      date: task.dueDate,
      status: task.status,
      project: task.project?.name
    }))
  });
});
