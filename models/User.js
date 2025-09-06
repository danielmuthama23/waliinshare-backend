import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  country: String,
  city: String,
  dateOfBirth: { type: Date },
  photoID: {
    data: Buffer,
    contentType: String,
  },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  numberOfShares:{type:Number,default:0 },
  guardianDetails: {
    name: { type: String },
    relationship: { type: String },
    contact: { type: String }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
