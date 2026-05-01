import { Router } from 'express';
import { body } from 'express-validator';
import { listMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.get('/:projectId/messages', protect, listMessages);
router.post('/:projectId/messages', protect, [body('message').trim().notEmpty().withMessage('Message is required.'), validate], sendMessage);
export default router;
