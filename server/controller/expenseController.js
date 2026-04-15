// controllers/expenseController.js
import Expense from '../models/Expense.js';

// ─── GET /api/expenses/stats ───────────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const expenses = await Expense.find({ user: userId })
      .sort({ date: -1 });

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((s, e) => s + e.amount, 0);

    const totalExpense = expenses
      .filter(e => e.type === 'expense')
      .reduce((s, e) => s + e.amount, 0);

    res.json({
      total:   totalIncome - totalExpense,
      income:  totalIncome,
      expense: totalExpense,
      recent:  expenses.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: 'Stats fetch nahi hue', error: err.message });
  }
};

// ─── GET /api/expenses/analytics?period=month ─────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user._id;

    const now = new Date();
    let startDate;
    if (period === 'week')
      startDate = new Date(now - 7 * 86400000);
    else if (period === 'month')
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === 'year')
      startDate = new Date(now.getFullYear(), 0, 1);
    else
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenses = await Expense.find({
      user: userId,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((s, e) => s + e.amount, 0);

    const totalExpense = expenses
      .filter(e => e.type === 'expense')
      .reduce((s, e) => s + e.amount, 0);

    // ── Category breakdown (expenses only) ──
    const catMap = {};
    expenses
      .filter(e => e.type === 'expense')
      .forEach(e => {
        const name = e.category?.name || 'Other';
        if (!catMap[name]) {
          catMap[name] = { name, emoji: e.category?.emoji || '💸', amount: 0 };
        }
        catMap[name].amount += e.amount;
      });

    const categoryBreakdown = Object.values(catMap)
      .sort((a, b) => b.amount - a.amount)
      .map(c => ({ ...c, value: c.amount }));

    const topCategories = categoryBreakdown.slice(0, 5);

    // ── Daily trend (last 14 unique days) ──
    const dailyMap = {};
    expenses.forEach(e => {
      const day = new Date(e.date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short',
      });
      if (!dailyMap[day]) dailyMap[day] = { date: day, income: 0, expense: 0 };
      dailyMap[day][e.type] += e.amount;
    });
    const dailyTrend = Object.values(dailyMap).slice(-14);

    // ── Monthly comparison ──
    const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun',
                        'Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthMap = {};
    expenses.forEach(e => {
      const m = new Date(e.date).toLocaleDateString('en-IN', { month: 'short' });
      if (!monthMap[m]) monthMap[m] = { month: m, income: 0, expense: 0 };
      monthMap[m][e.type] += e.amount;
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
    res.status(500).json({ message: 'Analytics fetch nahi hue', error: err.message });
  }
};

// ─── GET /api/expenses ─────────────────────────────────────────────────────
export const getExpenses = async (req, res) => {
  try {
    const { type, category, startDate, endDate, search } = req.query;

    const filter = { user: req.user._id };

    if (type && type !== 'all')       filter.type = type;
    if (category)                     filter.category = category;
    if (search)                       filter.title = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Expenses fetch nahi hue', error: err.message });
  }
};

// ─── GET /api/expenses/:id ─────────────────────────
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id:  req.params.id,
      user: req.user._id,
    });

    if (!expense)
      return res.status(404).json({ message: 'Expense nahi mila' });

    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Expense fetch nahi hua', error: err.message });
  }
};

// ─── POST /api/expenses ─────────────────────────────
export const createExpense = async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    if (!title || !amount || !type || !category || !date)
      return res.status(400).json({ message: 'Saare required fields bharo' });

    if (!['income', 'expense'].includes(type))
      return res.status(400).json({ message: 'Type sirf income ya expense hona chahiye' });

    if (amount <= 0)
      return res.status(400).json({ message: 'Amount 0 se zyada hona chahiye' });

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
    res.status(500).json({ message: 'Expense create nahi hua', error: err.message });
  }
};

// ─── PUT /api/expenses/:id ─────────────────────────────────────────────────
export const updateExpense = async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    const expense = await Expense.findOne({
      _id:  req.params.id,
      user: req.user._id,
    });

    if (!expense)
      return res.status(404).json({ message: 'Expense nahi mila' });

    if (type && !['income', 'expense'].includes(type))
      return res.status(400).json({ message: 'Type sirf income ya expense hona chahiye' });

    if (amount !== undefined && Number(amount) <= 0)
      return res.status(400).json({ message: 'Amount 0 se zyada hona chahiye' });

    expense.title    = title?.trim()    ?? expense.title;
    expense.amount   = amount           ? Number(amount) : expense.amount;
    expense.type     = type             ?? expense.type;
    expense.category = category         ?? expense.category;
    expense.date     = date             ? new Date(date) : expense.date;
    expense.note     = note?.trim()     ?? expense.note;

    const updated = await expense.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Expense update nahi hua', error: err.message });
  }
};

// ─── DELETE /api/expenses/:id ──────────────────────────────────────────────
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id:  req.params.id,
      user: req.user._id,
    });

    if (!expense)
      return res.status(404).json({ message: 'Expense nahi mila' });

    await expense.deleteOne();
    res.json({ message: 'Expense delete ho gaya', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Expense delete nahi hua', error: err.message });
  }
};