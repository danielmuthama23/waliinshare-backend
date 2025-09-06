import express from 'express';
import { getCompanyValue, updateCompanyValue } from '../controllers/companyController.js';

import { protect } from '../middleware/authMiddleware.js'; // Use your existing middleware

const router = express.Router();

router.get('/', protect, getCompanyValue);

// ✅ Route to update company value (admin-only; later add admin check if needed)
router.put('/', protect, updateCompanyValue);

export default router;