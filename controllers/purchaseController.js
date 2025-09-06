import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { generateReceipt } from '../utils/generateReceipt.js';

// ✅ Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
export const upload = multer({ storage });

/**
 * ✅ Upload certificate photo (works for ALL payment methods)
 *    Route: POST /api/purchase/certificate-photo
 *    Form field: certificatePhoto (single file)
 *    Returns: { filename, url }
 */
export const uploadCertificatePhoto = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    // Save to Documents for admin viewing
    await Document.create({
      userId: user._id,
      documentType: 'certificatePhoto',
      filePath: file.filename,
    });

    return res.status(201).json({
      message: 'Certificate photo uploaded',
      filename: file.filename, // <- send this as certificatePhotoKey later
      url: `/uploads/${file.filename}`,
    });
  } catch (err) {
    console.error('Upload certificate photo error:', err);
    return res.status(500).json({ message: 'Failed to upload certificate photo' });
  }
};

/**
 * ✅ Manual Payment Purchase
 * - Accepts optional receipt screenshot (manual only)
 * - Accepts certificatePhoto either as uploaded file or via certificatePhotoKey
 *   (the filename returned by /certificate-photo)
 */
export const createPurchase = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const {
      shares,
      currency,
      totalPrice,
      gatewayFee,
      totalWithFee,
      paymentMethod,
      phone,
      certificatePhotoKey, // <-- NEW
    } = req.body;

    // Files from multipart
    const receiptFile = req.files?.screenshot?.[0];
    const certPhotoFile = req.files?.certificatePhoto?.[0];

    const receiptPath = receiptFile ? receiptFile.filename : null;

    // Prefer the key if provided; else take the uploaded file if present
    const certificatePhotoPath = certificatePhotoKey
      ? certificatePhotoKey
      : certPhotoFile
      ? certPhotoFile.filename
      : null;

    const newPurchase = new Purchase({
      userId: decoded.id,
      phone,
      shares,
      currency,
      totalPrice,
      gatewayFee,
      totalWithFee,
      paymentMethod,
      receipt: receiptPath,                // receipt only really used for manual
      certificatePhoto: certificatePhotoPath,
      status: 'pending',
    });

    await newPurchase.save();

    const user = await User.findById(decoded.id);

    // Save documents for admin
    if (receiptPath) {
      await Document.create({
        userId: user._id,
        documentType: 'receipt',
        filePath: receiptPath,
      });
    }
    if (certificatePhotoPath && !certPhotoFile) {
      // If cert photo came via key, it's already saved as a Document by uploadCertificatePhoto
      // If it came as file here, save a doc record now:
    }
    if (certPhotoFile) {
      await Document.create({
        userId: user._id,
        documentType: 'certificatePhoto',
        filePath: certPhotoFile.filename,
      });
    }

    // Generate receipt PDF for the purchase record (your existing logic)
    await generateReceipt(newPurchase, user);

    res.status(201).json({
      message: 'Purchase recorded successfully',
      purchaseId: newPurchase._id,
      receipt: `receipt-${newPurchase._id}.pdf`,
    });
  } catch (err) {
    console.error('❌ Manual Purchase Error:', err);
    res.status(500).json({ message: 'Failed to record purchase' });
  }
};

/**
 * ✅ PayPal Payment Purchase
 * - No receipt upload here
 * - Accepts certificatePhotoKey so certificate photo works for ALL methods
 */
export const handlePayPalPurchase = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const {
      shares,
      currency,
      totalPrice,
      gatewayFee,
      totalWithFee,
      phone,
      paypalDetails,
      certificatePhotoKey, // <-- NEW
    } = req.body;

    if (!paypalDetails?.id || !paypalDetails?.payer) {
      return res.status(400).json({ message: 'Incomplete PayPal transaction details' });
    }

    const newPurchase = new Purchase({
      userId: decoded.id,
      phone,
      shares,
      currency,
      totalPrice,
      gatewayFee,
      totalWithFee,
      paymentMethod: 'paypal',
      paypalDetails,
      certificatePhoto: certificatePhotoKey || null,
      status: 'pending',
    });

    await newPurchase.save();

    const user = await User.findById(decoded.id);
    await generateReceipt(newPurchase, user);

    res.status(201).json({
      message: 'PayPal purchase saved',
      purchaseId: newPurchase._id,
      receipt: `receipt-${newPurchase._id}.pdf`,
    });
  } catch (err) {
    console.error('❌ PayPal Purchase Error:', err);
    res.status(500).json({ message: 'PayPal purchase failed' });
  }
};

/**
 * ✅ Get Logged-In User's Purchases
 */
export const getMyShares = async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user._id });
    res.status(200).json(purchases);
  } catch (error) {
    console.error('❌ Get Shares Error:', error);
    res.status(500).json({ message: 'Server error fetching shares' });
  }
};

/**
 * ✅ Get Purchase Trend for Charts
 */
export const getMyShareTrends = async (req, res) => {
  try {
    const trends = await Purchase.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalShares: { $sum: '$shares' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalShares: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.status(200).json(trends);
  } catch (error) {
    console.error('❌ Trend Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch share trends' });
  }
};

/**
 * ✅ Admin Updates Purchase Status
 */
export const updatePurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['verified', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await Purchase.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.status(200).json({ message: 'Purchase status updated', purchase: updated });
  } catch (error) {
    console.error('❌ Status Update Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};