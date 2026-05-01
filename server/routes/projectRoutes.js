import { Router } from 'express';
import { body } from 'express-validator';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../controllers/projectController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', protect, listProjects);
router.get('/:id', protect, getProject);
router.post('/', protect, authorize('Admin'), [
  body('name').trim().notEmpty().withMessage('Project name is required.'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid project priority.'),
  validate
], createProject);
router.patch('/:id', protect, authorize('Admin'), updateProject);
router.delete('/:id', protect, authorize('Admin'), deleteProject);

export default router;
