import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

// Challenge financier : un objectif pour mettre plus d'argent de cote.
const challengeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date, default: null },
    status: { type: String, enum: ['active', 'done', 'failed'], default: 'active' },
    color: { type: String, default: '#F7A23B' },
    entries: { type: [progressSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Challenge', challengeSchema);
