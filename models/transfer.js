import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  toUserId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  toUserEmail: { type: String, required: true },
  sharesToTransfer: { type: Number, required: true },
  pricePerShare: { type: Number, required: true },
  note: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'BuyerApproved', 'AdminApproved', 'Completed', 'Rejected'], 
    default: 'Pending' 
  },
  buyerApproval: { type: Boolean, default: false },
  adminApproval: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Transfer', transferSchema);