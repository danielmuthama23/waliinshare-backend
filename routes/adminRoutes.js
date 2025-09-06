import express from 'express';
import {
  getAllUsers,
  getSubAdmins,
  toggleUserRole,
  toggleUserStatus,
  getPendingPurchases,
  getVerifiedPurchases,
  getRejectedPurchases,
  getAllPurchases,
  getUnderageUsers
} from '../controllers/adminController.js';

import {
  getCompanyValue,
  updateCompanyValue,
} from '../controllers/companyController.js';

import { updatePurchaseStatus } from '../controllers/purchaseController.js';
import { generateCertificate } from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';
import { getAllDocuments } from '../controllers/documentController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/documents', verifyAdmin, getAllDocuments);

// User Management
router.get('/all-users', protect, getAllUsers);
router.get('/sub-admins', protect, getSubAdmins);
router.put('/toggle-role/:id', protect, toggleUserRole);
router.put('/toggle-status/:id', protect, toggleUserStatus);

// Company Value
router.get('/company-value', protect, getCompanyValue);
router.put('/company-value', protect, updateCompanyValue);

// Purchase Management
router.get('/purchases/pending', protect, getPendingPurchases);
router.get('/purchases/verified', protect, getVerifiedPurchases);
router.get('/purchases/rejected', protect, getRejectedPurchases);
router.put('/purchases/:id/status', protect, updatePurchaseStatus);
router.get('/underage', protect, getUnderageUsers);


router.get('/purchases', protect, getAllPurchases); // ✅ New route
// Certificate
router.get('/generate-certificate/:purchaseId', protect, generateCertificate);

export default router;