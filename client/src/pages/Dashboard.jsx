import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api/axios';

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

const normalizeStats = (stats) => ({
  ...stats,
  recent:
    stats.recent?.map((expense) => ({
      ...expense,
      category: normalizeCategory(expense.category?.name || expense.category),
    })) || [],
});

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, income: 0, expense: 0, recent: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/expenses/stats')
      .then(({ data }) => setStats(normalizeStats(data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: stats.total < 0 ? 'Balance Deficit' : 'Total Balance',
      value: Math.abs(stats.total),
      icon: Wallet,
      color: stats.total < 0 ? 'orange' : 'blue',
    },
    {
      label: 'Income',
      value: stats.income,
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Expense',
      value: stats.expense,
      icon: TrendingDown,
      color: 'red',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Link to="/expenses?new=1" className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Expense
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {cards.map((card) => {
            const StatIcon = card.icon;

            return (
              <div key={card.label} className="card flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorMap[card.color]}`}>
                  <StatIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  {loading ? (
                    <div className="h-7 w-24 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : (
                    <p className={`text-2xl font-bold ${card.color === 'orange' ? 'text-orange-600' : 'text-gray-900'}`}>
                      ₹{card.value?.toLocaleString('en-IN') || '0'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : stats.recent?.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No transactions found</p>
              <Link to="/expenses?new=1" className="text-green-600 text-sm font-medium mt-2 inline-block">
                Add your first expense →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.recent.map((expense) => (
                <div key={expense._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{expense.category?.emoji || '💸'}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{expense.title}</p>
                      <p className="text-xs text-gray-400">
                        {expense.category?.name} · {new Date(expense.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${expense.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {expense.type === 'income' ? '+' : '-'}₹{expense.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
