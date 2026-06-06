import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

// Objectif d'epargne (pochette / vault facon Revolut).
const savingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    targetAmount: { type: Number, default: 0, min: 0 },
    currentAmount: { type: Number, default: 0 },
    color: { type: String, default: '#2BBA88' },
    contributions: { type: [contributionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Saving', savingSchema);
