import mongoose from 'mongoose';

// Charge fixe / recurrente (loyer, abonnements, credit, assurances...).
const fixedChargeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    dayOfMonth: { type: Number, min: 1, max: 31, default: 1 },
    active: { type: Boolean, default: true },
    note: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('FixedCharge', fixedChargeSchema);
