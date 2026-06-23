import { Router } from 'express';
import Income from '../models/Income.js';
import FixedCharge from '../models/FixedCharge.js';
import Transaction from '../models/Transaction.js';
import Saving from '../models/Saving.js';
import Challenge from '../models/Challenge.js';
import Category from '../models/Category.js';
import { withCategories } from '../populate.js';
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
    const uid = req.userId;

    const incomes = Income.find({ user: uid, active: true });
    const charges = FixedCharge.find({ user: uid, active: true });
    const savings = Saving.find({ user: uid }).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const challenges = Challenge.find({ user: uid }).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const allTx = Transaction.find({ user: uid });

    const totalStableIncome = incomes.reduce((s, i) => s + Number(i.amount || 0), 0);
    const totalFixedCharges = charges.reduce((s, c) => s + Number(c.amount || 0), 0);

    // Transactions du mois courant.
    const monthTx = allTx.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
    const monthExpenses = monthTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const monthExtraIncome = monthTx
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    // Depenses du mois groupees par categorie (pour le donut).
    const catMap = new Map();
    for (const t of monthTx) {
      if (t.type !== 'expense') continue;
      const key = t.category || 'none';
      catMap.set(key, (catMap.get(key) || 0) + Number(t.amount || 0));
    }
    const expensesByCategory = [...catMap.entries()]
      .map(([categoryId, total]) => {
        const cat = categoryId === 'none' ? null : Category.findById(categoryId);
        return {
          categoryId: categoryId === 'none' ? null : categoryId,
          name: cat?.name || 'Non classe',
          color: cat?.color || '#8A8FA3',
          total,
        };
      })
      .sort((a, b) => b.total - a.total);

    // Tendance des 6 derniers mois (revenus reels vs depenses).
    const sixMonthsAgo = new Date(year, month - 5, 1);
    const trendMap = {};
    for (let k = 5; k >= 0; k--) {
      const d = new Date(year, month - k, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      trendMap[key] = {
        label: d.toLocaleDateString('fr-FR', { month: 'short' }),
        expense: 0,
        income: 0,
      };
    }
    for (const t of allTx) {
      const d = new Date(t.date);
      if (d < sixMonthsAgo || d > end) continue;
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (trendMap[key]) trendMap[key][t.type] += Number(t.amount || 0);
    }
    const monthlyTrend = Object.values(trendMap);

    const recent = [...allTx]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    const totalSaved = savings.reduce((s, v) => s + Number(v.currentAmount || 0), 0);
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
      expensesByCategory,
      monthlyTrend,
      savings,
      challenges,
      recentTransactions: withCategories(recent),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
