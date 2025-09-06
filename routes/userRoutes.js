import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyProfile,getTotalShares } from '../controllers/userController.js';


const router = express.Router();

// 👇 Add this route
router.get('/me', protect, getMyProfile);;
router.get('/:id/total-shares', getTotalShares);

export default router;