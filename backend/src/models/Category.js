import mongoose from 'mongoose';

// Categorie de depense ou de revenu. La couleur sert a la visualisation (donut, barres).
const categorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['expense', 'income'], default: 'expense' },
    color: { type: String, default: '#6E56F7' },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
