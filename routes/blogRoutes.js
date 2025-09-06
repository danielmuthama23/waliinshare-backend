import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

// Multer setup for blog image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

// 📌 Public: Get all blogs
router.get('/', getAllBlogs);

// 📌 Public: Get single blog
router.get('/:id', getSingleBlog);

// 🔒 Admin: Create blog
router.post('/', protect, upload.single('image'), createBlog);

// 🔒 Admin: Update blog
router.put('/:id', protect, upload.single('image'), updateBlog);

// 🔒 Admin: Delete blog
router.delete('/:id', protect, deleteBlog);

export default router;