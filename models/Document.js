import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  documentType: { 
    type: String, 
    required: true 
  },
  file: {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true }
  },
  uploadedBy: { 
    type: String, 
    enum: ['user', 'system'], 
    default: 'user' 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.model('Document', documentSchema);
