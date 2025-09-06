import express from 'express';
import { upload, uploadDocument, getUserDocuments, getAllDocuments, verifyDocument } from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/documents/upload
router.post('/upload', protect, upload.single('file'), uploadDocument);

// GET /api/documents/my
router.get('/my', protect, getUserDocuments);

// GET /api/documents (admin only)
router.get('/', protect, getAllDocuments);

// PUT /api/documents/verify/:id (admin verify document)
router.put('/verify/:id', protect, verifyDocument);

export default router;
