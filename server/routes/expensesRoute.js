const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const CATEGORY_EMOJI = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '📄',
  Health: '💊',
  Entertainment: '🎬',
  Salary: '💰',
  Other: '💸',
};

const normalizeCategory = (category) => ({
  name: category || 'Other',
  emoji: CATEGORY_EMOJI[category] || '💸',
});

const normalizeExpense = (expense) => ({
  ...expense.toObject(),
  category: normalizeCategory(expense.category),
});

router.use(protect);

router.get('/stats', async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    const totalIncome = expenses
      .filter((expense) => expense.type === 'income')
      .reduce((sum, expense) => sum + expense.amount, 0);
    const totalExpense = expenses
      .filter((expense) => expense.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0);

    res.json({
      total: totalIncome - totalExpense,
      income: totalIncome,
      expense: totalExpense,
      recent: expenses.slice(0, 5).map(normalizeExpense),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const now = new Date();
    let startDate = null;

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 86400000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filter = { user: req.user._id };
    if (startDate) {
      filter.date = { $gte: startDate };
    }

    const expenses = await Expense.find(filter).sort({ date: 1 });

    const totalIncome = expenses
      .filter((expense) => expense.type === 'income')
      .reduce((sum, expense) => sum + expense.amount, 0);
    const totalExpense = expenses
      .filter((expense) => expense.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0);

    const categoryMap = {};
    expenses
      .filter((expense) => expense.type === 'expense')
      .forEach((expense) => {
        const name = expense.category || 'Other';
        if (!categoryMap[name]) {
          categoryMap[name] = {
            name,
            emoji: CATEGORY_EMOJI[name] || '💸',
            amount: 0,
          };
        }
        categoryMap[name].amount += expense.amount;
      });

    const categoryBreakdown = Object.values(categoryMap)
      .sort((a, b) => b.amount - a.amount)
      .map((category) => ({ ...category, value: category.amount }));

    const topCategories = categoryBreakdown.slice(0, 5);

    const dailyMap = {};
    expenses.forEach((expense) => {
      const day = new Date(expense.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });

      if (!dailyMap[day]) {
        dailyMap[day] = { date: day, income: 0, expense: 0 };
      }

      dailyMap[day][expense.type] += expense.amount;
    });

    const dailyTrend = Object.values(dailyMap).slice(-14);

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthMap = {};

    expenses.forEach((expense) => {
      const month = new Date(expense.date).toLocaleDateString('en-IN', { month: 'short' });
      if (!monthMap[month]) {
        monthMap[month] = { month, income: 0, expense: 0 };
      }
      monthMap[month][expense.type] += expense.amount;
    });

    const monthlyComparison = Object.values(monthMap)
      .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

    res.json({
      totalIncome,
      totalExpense,
      categoryBreakdown,
      topCategories,
      dailyTrend,
      monthlyComparison,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { category, startDate, endDate } = req.query;
  const filter = { user: req.user._id };

  if (category) {
    filter.category = category;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.date.$lte = new Date(endDate);
    }
  }

  const expenses = await Expense.find(filter).sort({ date: -1 });
  res.json(expenses);
});

router.post('/', async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    if (!title || !amount || !type || !category || !date) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date: new Date(date),
      note: note?.trim() || '',
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create expense', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  res.json(expense);
});

router.delete('/:id', async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  res.json({ message: 'Expense deleted' });
});

router.get('/summary', async (req, res) => {
  const summary = await Expense.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
  ]);

  res.json(summary);
});

module.exports = router;
