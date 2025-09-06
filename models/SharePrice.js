import mongoose from "mongoose";

const SharePriceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  price: { type: Number, required: true } // single share price
});

export default mongoose.model("SharePrice", SharePriceSchema);