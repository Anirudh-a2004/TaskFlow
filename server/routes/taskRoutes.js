import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import {
  addAttachment,
  addComment,
  createTask,
  deleteTask,
  listComments,
  listTasks,
  reorderTasks,
  updateTask
} from '../controllers/taskController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const upload = multer({ dest: process.env.UPLOAD_DIR || 'uploads' });
const router = Router();

router.get('/', protect, listTasks);
router.post('/', protect, authorize('Admin'), [
  body('title').trim().notEmpty().withMessage('Task title is required.'),
  body('project').isMongoId().withMessage('Valid project is required.'),
  validate
], createTask);
router.patch('/reorder', protect, reorderTasks);
router.patch('/:id', protect, updateTask);
router.delete('/:id', protect, authorize('Admin'), deleteTask);
router.get('/:id/comments', protect, listComments);
router.post('/:id/comments', protect, [body('body').trim().notEmpty().withMessage('Comment is required.'), validate], addComment);
router.post('/:id/attachments', protect, upload.single('file'), addAttachment);

export default router;
