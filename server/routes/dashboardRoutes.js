import { Router } from 'express';
import { dashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', protect, dashboard);
export default router;
