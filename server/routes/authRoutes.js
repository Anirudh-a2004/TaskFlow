import { Router } from 'express';
import { body } from 'express-validator';
import { forgotPassword, login, me, resetPassword, signup } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/signup', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').optional().isIn(['Admin', 'Member']).withMessage('Role must be Admin or Member.'),
  body('inviteCode').optional().trim().isString(),
  validate
], signup);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
  validate
], login);

router.post('/forgot-password', [body('email').isEmail().withMessage('Valid email is required.'), validate], forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  validate
], resetPassword);
router.get('/me', protect, me);

export default router;
