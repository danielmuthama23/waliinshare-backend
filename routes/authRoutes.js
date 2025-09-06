import express from 'express';
import multer from 'multer';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// ✅ Multer memory storage (for storing in MongoDB)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, JPEG, PNG files allowed'));
  },
});

// Signup route (requires photoID)
router.post(
  '/signup',
  (req, res, next) => {
    upload.single('photoID')(req, res, function (err) {
      if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
      if (err) return res.status(400).json({ message: err.message });
      if (!req.file) return res.status(400).json({ message: 'photoID is required' });
      next();
    });
  },
  registerUser
);

router.post('/signin', loginUser);

export default router;
