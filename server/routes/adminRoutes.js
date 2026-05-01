import { Router } from 'express';
import {
  adminOverview,
  adminProjects,
  adminTasks,
  adminUsers,
  archiveProject,
  auditLogs,
  backupData,
  bulkTaskUpdate,
  createAnnouncement,
  resetUserPassword,
  updateProjectAdmin,
  updateUserAdmin,
  userActivity
} from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, authorize('Admin'));
router.get('/overview', adminOverview);
router.get('/users', adminUsers);
router.patch('/users/:id', updateUserAdmin);
router.post('/users/:id/reset-password', resetUserPassword);
router.get('/users/:id/activity', userActivity);
router.get('/projects', adminProjects);
router.patch('/projects/:id', updateProjectAdmin);
router.patch('/projects/:id/archive', archiveProject);
router.get('/tasks', adminTasks);
router.patch('/tasks/bulk', bulkTaskUpdate);
router.get('/audit-logs', auditLogs);
router.post('/announcements', createAnnouncement);
router.get('/backup', backupData);

export default router;
