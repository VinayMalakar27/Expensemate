const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ['income', 'expense'],
    default: 'expense',
  },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Salary', 'Other'],
    default: 'Other'
  },
  date: { type: Date, default: Date.now },
  note: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
