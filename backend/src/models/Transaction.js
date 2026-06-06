import mongoose from 'mongoose';

// Mouvement reel d'argent : une depense, ou un revenu ponctuel (extra, freelance...).
// 'source' explique COMMENT l'argent est arrive (utile pour les revenus / challenges).
const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['expense', 'income'], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true, default: '' },
    source: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

transactionSchema.index({ date: -1 });

export default mongoose.model('Transaction', transactionSchema);
