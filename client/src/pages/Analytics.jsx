import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, BarChart2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import API from '../api/axios';

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const EMPTY_STATE_TEXT = 'No data available for the selected period.';

const Skeleton = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-6 bg-gray-200 rounded w-1/3" />
    <div className="h-52 bg-gray-100 rounded-xl" />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      {label && <p className="font-medium text-gray-700 mb-1">{label}</p>}
      {payload.map((item, index) => (
        <p key={index} style={{ color: item.color }} className="font-semibold">
          {item.name}: ₹{Number(item.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) {
    return null;
  }

  const radian = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * radian);
  const y = cy + radius * Math.sin(-midAngle * radian);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    API.get(`/expenses/analytics?period=${period}`)
      .then(({ data: response }) => setData(response))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  const summaryCards = data
    ? [
        {
          label: 'Total Income',
          value: data.totalIncome,
          icon: TrendingUp,
          color: 'text-green-600',
          bg: 'bg-green-50',
        },
        {
          label: 'Total Expense',
          value: data.totalExpense,
          icon: TrendingDown,
          color: 'text-red-500',
          bg: 'bg-red-50',
        },
        {
          label: 'Net Balance',
          value: data.totalIncome - data.totalExpense,
          icon: Wallet,
          color: data.totalIncome >= data.totalExpense ? 'text-blue-600' : 'text-orange-500',
          bg: 'bg-blue-50',
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          </div>

          <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1 self-start">
            {[
              { key: 'all', label: 'All Time' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
              { key: 'year', label: 'This Year' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  if (key !== period) {
                    setLoading(true);
                    setPeriod(key);
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === key ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {loading
            ? [1, 2, 3].map((item) => (
                <div key={item} className="card animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-6 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            : summaryCards.map((card) => {
                const StatIcon = card.icon;

                return (
                  <div key={card.label} className="card flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${card.bg}`}>
                      <StatIcon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{card.label}</p>
                      <p className={`text-2xl font-bold ${card.color}`}>
                        {card.value < 0 ? '-' : ''}₹{Math.abs(card.value || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                );
              })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Income vs Expense</h2>
            {loading ? (
              <Skeleton />
            ) : !data?.monthlyComparison?.length ? (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                {EMPTY_STATE_TEXT}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.monthlyComparison} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Category Breakdown</h2>
            {loading ? (
              <Skeleton />
            ) : !data?.categoryBreakdown?.length ? (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                {EMPTY_STATE_TEXT}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={<CustomPieLabel />}
                    >
                      {data.categoryBreakdown.map((item, index) => (
                        <Cell key={item.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex flex-col gap-1.5 min-w-[120px]">
                  {data.categoryBreakdown.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-gray-600 truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Spending Trend</h2>
          {loading ? (
            <Skeleton />
          ) : !data?.dailyTrend?.length ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              {EMPTY_STATE_TEXT}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.dailyTrend} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {!loading && data?.topCategories?.length > 0 && (
          <div className="card mt-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Top Spending Categories</h2>
            <div className="space-y-3">
              {data.topCategories.map((category, index) => {
                const percentage = data.totalExpense
                  ? Math.round((category.amount / data.totalExpense) * 100)
                  : 0;

                return (
                  <div key={category.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span>{category.emoji || '💸'}</span>
                        <span className="font-medium text-gray-700">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-xs">{percentage}%</span>
                        <span className="font-semibold text-gray-900">
                          ₹{category.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          background: PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
