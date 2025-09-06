import mongoose from 'mongoose';

const companyValueSchema = new mongoose.Schema({
  totalValueUSD: { type: Number, required: true },
  sharePriceUSD: { type: Number, required: true },
  sharePriceETB: { type: Number, required: true },
  sharesAvailable: { type: Number, required: true },
  deadline: { type: Date, required: true },
}, { timestamps: true });

const CompanyValue = mongoose.model('CompanyValue', companyValueSchema);
export default CompanyValue;