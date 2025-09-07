import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import companyValueRoutes from './routes/companyValueRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import paymentRoutes from './routes/paymentRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import transferRoutes from './routes/transferRoutes.js'; 
import userSearchEamilRoutes from './routes/userSearchEmailRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from "./routes/analyticsRoutes.js";

// Load environment variables
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});


// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== ✅ CORS Configuration ==================
const isProd = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  // process.env.ADMIN_URL || 'http://localhost:5174',
  // 'http://127.0.0.1:5173',
  // 'http://127.0.0.1:5174',
];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without Origin (SSR, curl, Postman) and allow all in dev
    if (!origin || !isProd) return callback(null, true);

    // Strict check in prod
    const ok = allowedOrigins.includes(origin);
    if (ok) return callback(null, true);

    console.warn('❌ Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
// ============================================================

// Middleware
app.use(express.json());

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company-value', companyValueRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/users', userSearchEamilRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics',analyticsRoutes);

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

The key fingerprint is:
SHA256:IxMEiIBXdLaQ2WU4u9sbubMLloeCCQYvWvDp+SaxvQY github-actions-deploy