import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  shares: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['USD', 'ETB'],
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  gatewayFee: {
    type: Number,
  },
  totalWithFee: {
    type: Number,
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'telebirr', 'manual'],
    required: true,
  },
  receipt: {
    type: String, // Manual uploads
  },
  paypalDetails: {
    type: Object, // Store PayPal transaction details (payer, id, email, etc.)
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  certificate: {
    type: String, // Certificate path after approval
  },
  certificatePhoto: { type: String, },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);