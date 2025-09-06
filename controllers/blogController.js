import Blog from '../models/Blog.js';
import fs from 'fs';
import path from 'path';

// Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const blog = new Blog({
      title,
      content,
      author,
      image,
    });

    await blog.save();
    res.status(201).json({ message: 'Blog created successfully', blog });
  } catch (err) {
    console.error('❌ Blog creation error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get All Blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
};

// Get Single Blog
export const getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blog' });
  }
};

// Update Blog
export const updateBlog = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Delete old image if a new one is uploaded
    if (req.file && blog.image) {
      const oldImagePath = path.join('uploads', path.basename(blog.image));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.author = author || blog.author;
    blog.image = req.file ? `/uploads/${req.file.filename}` : blog.image;

    await blog.save();
    res.json({ message: 'Blog updated', blog });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update blog' });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Delete image file if it exists
    if (blog.image) {
      const imagePath = path.join('uploads', path.basename(blog.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete blog' });
  }
};