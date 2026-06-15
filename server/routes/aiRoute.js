const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.use(protect);

// Helper - user ka expense data fetch karna
const getUserExpenseData = async (userId) => {
  const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const categoryMap = {};
  expenses
    .filter(e => e.type === 'expense')
    .forEach(e => {
      const cat = e.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + e.amount;
    });

  const recentExpenses = expenses.slice(0, 10).map(e => ({
    title: e.title,
    amount: e.amount,
    type: e.type,
    category: e.category,
    date: e.date,
  }));

  return { totalIncome, totalExpense, balance: totalIncome - totalExpense, categoryMap, recentExpenses };
};

// 📊 Route 1: Auto Insights
router.get('/insights', async (req, res) => {
  try {
    const data = await getUserExpenseData(req.user._id);

    const prompt = `You are a personal finance assistant. Analyze this user's expense data and give 3-4 short actionable insights in simple English. Be friendly and specific.

User Financial Data:
- Total Income: ₹${data.totalIncome}
- Total Expense: ₹${data.totalExpense}
- Balance: ₹${data.balance}
- Category-wise spending: ${JSON.stringify(data.categoryMap)}
- Recent transactions: ${JSON.stringify(data.recentExpenses)}

Return ONLY this JSON, no extra text:
{
  "insights": [
    { "title": "short title", "message": "detailed message", "type": "warning|success|tip" }
  ],
  "savingScore": 0-100,
  "topSuggestion": "one main suggestion"
}`;

    const response = await ai.models.generateContent({
      model: 'models/gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: 'AI insights failed', error: err.message });
  }
});

// 💬 Route 2: AI Chat
router.post('/chat', async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const data = await getUserExpenseData(req.user._id);

    const systemContext = `You are ExpenseMate AI, a friendly personal finance assistant. 
Help users understand their expenses and give smart advice.
Always respond in simple English. Be concise and helpful.

Current User Financial Summary:
- Income: ₹${data.totalIncome}
- Expense: ₹${data.totalExpense}
- Balance: ₹${data.balance}
- Category breakdown: ${JSON.stringify(data.categoryMap)}
- Recent transactions: ${JSON.stringify(data.recentExpenses)}`;

    const fullPrompt = `${systemContext}\n\nUser: ${message}`;

    const response = await ai.models.generateContent({
      model: 'models/gemini-2.0-flash',
      contents: fullPrompt,
    });

    res.json({ reply: response.text });
 } catch (err) {
  console.error('AI Chat Error:', err);
  if (err.status === 429) {
    return res.status(429).json({ 
      message: 'AI is busy, please wait a moment and try again!',
      error: 'RATE_LIMIT'
    });
  }
  res.status(500).json({ message: 'AI chat failed', error: err.message });
}
});

// 🎯 Route 3: Budget Suggestions
router.get('/budget-suggestions', async (req, res) => {
  try {
    const data = await getUserExpenseData(req.user._id);

    const prompt = `Based on this user's spending, suggest a realistic monthly budget.

Spending data: ${JSON.stringify(data.categoryMap)}
Total Income: ₹${data.totalIncome}

Return ONLY this JSON, no extra text:
{
  "suggestedBudget": {
    "Food": number,
    "Transport": number,
    "Shopping": number,
    "Bills": number,
    "Health": number,
    "Entertainment": number,
    "Savings": number
  },
  "advice": "one line advice"
}`;

    const response = await ai.models.generateContent({
      model: 'models/gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: 'Budget suggestions failed', error: err.message });
  }
});

module.exports = router;