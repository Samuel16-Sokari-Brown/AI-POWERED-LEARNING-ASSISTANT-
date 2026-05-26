import express from 'express';
import {
  getDashboard,
  resetProgress,
} from '../controller/progressController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.post('/reset', resetProgress);

export default router;
