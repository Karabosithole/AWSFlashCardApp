import express from 'express';
import { getStats, getStudyHistory } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Routes
router.get('/stats', authenticate, getStats as any);
router.get('/study-history', authenticate, getStudyHistory as any);

export default router;
