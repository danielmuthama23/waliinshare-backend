import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';


import {
  createPurchase,
  getMyShares,
  getMyShareTrends,
  uploadCertificatePhoto,
} from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ✅ Multer config (supporting both screenshot and certificatePhoto)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// ✅ Routes

// Share purchase (manual) with screenshot + certificatePhoto
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'screenshot', maxCount: 1 },
    { name: 'certificatePhoto', maxCount: 1 },
  ]),
  createPurchase
);

// Get user's purchases
router.get('/my-shares', protect, getMyShares);

// Get trend data for charts
router.get('/my-shares-trend', protect, getMyShareTrends);

// ✅ Receipt download endpoint
router.get('/receipt/:filename', protect, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '..', 'receipts', filename);
  res.download(filePath, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(404).send('Receipt not found');
    }
  });
});




// Upload cert photo (single file)
router.post(
  '/certificate-photo',
  protect,
  upload.single('certificatePhoto'),
  uploadCertificatePhoto
);

// Manual purchase (receipt + optional inline cert photo)
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'screenshot', maxCount: 1 },
    { name: 'certificatePhoto', maxCount: 1 }, // optional (manual inline)
  ]),
  createPurchase
);
export default router;