import { Router } from 'express';
import { body } from 'express-validator';
import {
  approveProjectCompletion,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
  updateProjectMembers
} from '../controllers/projectController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', protect, listProjects);
router.get('/:id', protect, getProject);
router.post('/:id/approve-completion', protect, approveProjectCompletion);
router.post('/', protect, authorize('Admin'), [
  body('name').trim().notEmpty().withMessage('Project name is required.'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid project priority.'),
  validate
], createProject);
router.patch('/:id/members', protect, [
  body('members').isArray({ min: 1 }).withMessage('At least one member is required.'),
  body('members.*').notEmpty().withMessage('Member ID is required.'),
  validate
], updateProjectMembers);
router.patch('/:id', protect, updateProject);
router.delete('/:id', protect, authorize('Admin'), deleteProject);

export default router;
