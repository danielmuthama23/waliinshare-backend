import mongoose from "mongoose";

const CompanyGrowthSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  growth: { type: Number, required: true } // e.g. valuation, index score
});

export default mongoose.model("CompanyGrowth", CompanyGrowthSchema);