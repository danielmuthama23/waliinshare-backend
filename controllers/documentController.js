import Document from '../models/Document.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';

// 👉 Use memory storage (not disk) so file is kept in RAM and we can save to DB
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/**
 * Upload document and save in MongoDB
 */
export const uploadDocument = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { documentType } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const doc = new Document({
      userId,
      documentType,
      file: {
        data: req.file.buffer,         // actual file stored in MongoDB
        contentType: req.file.mimetype // e.g., "image/png"
      }
    });

    await doc.save();
    res.status(201).json({ message: 'Document uploaded successfully', doc });
  } catch (err) {
    console.error('Upload Document Error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
};

/**
 * Get all documents for logged-in user
 */
export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const docs = await Document.find({ userId });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user documents' });
  }
};

/**
 * Get all documents (Admin only)
 */
export const getAllDocuments = async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const docs = await Document.find().populate('userId', 'fullName email');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
};

/**
 * Verify a document (Admin only)
 */
export const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findByIdAndUpdate(id, { isVerified: true }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document verified', doc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify document' });
  }
};
