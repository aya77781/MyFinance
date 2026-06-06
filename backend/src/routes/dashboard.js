import { Router } from 'express';
import mongoose from 'mongoose';
import Income from '../models/Income.js';
import FixedCharge from '../models/FixedCharge.js';
import Transaction from '../models/Transaction.js';
import Saving from '../models/Saving.js';
import Challenge from '../models/Challenge.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

function monthRange(year, month) {
  // month : 0-11
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = req.query.month != null ? Number(req.query.month) : now.getMonth();
    const { start, end } = monthRange(year, month);
    const uid = new mongoose.Types.ObjectId(req.userId);

    const [incomes, charges, savings, challenges] = await Promise.all([
      Income.find({ user: uid, active: true }),
      FixedCharge.find({ user: uid, active: true }),
      Saving.find({ user: uid }),
      Challenge.find({ user: uid }),
    ]);

    const totalStableIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalFixedCharges = charges.reduce((s, c) => s + c.amount, 0);

    // Agregation des transactions du mois par type.
    const byType = await Transaction.aggregate([
      { $match: { user: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const monthExpenses = byType.find((t) => t._id === 'expense')?.total || 0;
    const monthExtraIncome = byType.find((t) => t._id === 'income')?.total || 0;

    // Depenses du mois groupees par categorie (pour le donut).
    const expensesByCategory = await Transaction.aggregate([
      { $match: { user: uid, type: 'expense', date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { total: -1 } },
    ]);

    const categories = expensesByCategory.map((c) => ({
      categoryId: c._id,
      name: c.category?.name || 'Non classe',
      color: c.category?.color || '#8A8FA3',
      total: c.total,
    }));

    // Tendance des 6 derniers mois (revenus reels vs depenses).
    const sixMonthsAgo = new Date(year, month - 5, 1);
    const trend = await Transaction.aggregate([
      { $match: { user: uid, date: { $gte: sixMonthsAgo, $lte: end } } },
      {
        $group: {
          _id: { y: { $year: '$date' }, m: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
    ]);
    const trendMap = {};
    for (let k = 5; k >= 0; k--) {
      const d = new Date(year, month - k, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      trendMap[key] = { label: d.toLocaleDateString('fr-FR', { month: 'short' }), expense: 0, income: 0 };
    }
    for (const row of trend) {
      const key = `${row._id.y}-${row._id.m}`;
      if (trendMap[key]) trendMap[key][row._id.type] = row.total;
    }
    const monthlyTrend = Object.values(trendMap);

    const recent = await Transaction.find({ user: uid })
      .populate('category')
      .sort({ date: -1 })
      .limit(8);

    const totalSaved = savings.reduce((s, v) => s + v.currentAmount, 0);
    const realIncome = totalStableIncome + monthExtraIncome;
    const totalOut = totalFixedCharges + monthExpenses;
    const net = realIncome - totalOut;

    res.json({
      period: { year, month },
      summary: {
        stableIncome: totalStableIncome,
        extraIncome: monthExtraIncome,
        realIncome,
        fixedCharges: totalFixedCharges,
        variableExpenses: monthExpenses,
        totalOut,
        net,
        totalSaved,
        savingsRate: realIncome > 0 ? Math.round((net / realIncome) * 100) : 0,
      },
      expensesByCategory: categories,
      monthlyTrend,
      savings,
      challenges,
      recentTransactions: recent,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
