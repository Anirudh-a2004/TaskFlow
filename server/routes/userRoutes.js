import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { listUsers, updateProfile, updateUserRole } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const upload = multer({ dest: process.env.UPLOAD_DIR || 'uploads' });
const router = Router();

router.get('/', protect, listUsers);
router.patch('/profile', protect, upload.single('avatar'), updateProfile);
router.patch('/:id/role', protect, authorize('Admin'), [
  body('role').isIn(['Admin', 'Member']).withMessage('Role must be Admin or Member.'),
  validate
], updateUserRole);

export default router;
