import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, X, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ExpenseCard from '../components/ExpenseCard';
import API from '../api/axios';

const CATEGORIES = [
  { name: 'Food', emoji: '🍔' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Bills', emoji: '📄' },
  { name: 'Health', emoji: '💊' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Salary', emoji: '💰' },
  { name: 'Other', emoji: '💸' },
];

const normalizeCategory = (category) =>
  CATEGORIES.find((cat) => cat.name === category) || { name: category || 'Other', emoji: '💸' };

const normalizeExpense = (expense) => ({
  ...expense,
  category: normalizeCategory(expense.category),
});

const emptyForm = {
  title: '', amount: '', type: 'expense',
  category: CATEGORIES[0], date: new Date().toISOString().split('T')[0], note: ''
};

export default function Expenses() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchExpenses = async () => {
    try {
      const { data } = await API.get('/expenses');
      setExpenses(data.map(normalizeExpense));
    } catch {
      toast.error('Expenses load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') {
      setForm(emptyForm);
      setEditId(null);
      setShowModal(true);
      params.delete('new');
      navigate(
        {
          pathname: location.pathname,
          search: params.toString() ? `?${params.toString()}` : '',
        },
        { replace: true }
      );
    }
  }, [location.pathname, location.search, navigate]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (exp) => {
    setForm({
      title: exp.title,
      amount: exp.amount,
      type: exp.type,
      category: typeof exp.category === 'string' ? normalizeCategory(exp.category) : exp.category,
      date: new Date(exp.date).toISOString().split('T')[0],
      note: exp.note || '',
    });
    setEditId(exp._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    const payload = {
      ...form,
      amount: Number(form.amount),
      category: typeof form.category === 'string' ? form.category : form.category.name,
    };

    if (editId) {
      await API.put(`/expenses/${editId}`, payload);
      toast.success('update successful!');
    } else {
      await API.post('/expenses', payload);
      toast.success('Expense add successful!');
    }

    setShowModal(false);
    fetchExpenses();

  } catch (err) {
    console.log(err.response?.data); // 🔍 debug ke liye
    toast.error(err.response?.data?.message || 'error');
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karna hai?')) return;
    try {
      await API.delete(`/expenses/${id}`);
      toast.success('Delete ho gaya!');
      setExpenses(prev => prev.filter(e => e._id !== id));
    } catch {
      toast.error('Delete nahi hua');
    }
  };

  const filtered = expenses.filter(exp => {
    const matchSearch = exp.title.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType === 'all' || exp.type === filterType;
    return matchSearch && matchType;
  });

  const totalExpense = filtered
    .filter(e => e.type === 'expense')
    .reduce((s, e) => s + e.amount, 0);
  const totalIncome = filtered
    .filter(e => e.type === 'income')
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New
          </button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card py-3 flex items-center gap-3">
            <span className="text-2xl">💸</span>
            <div>
              <p className="text-xs text-gray-500">Total Expense</p>
              <p className="text-lg font-bold text-red-500">
                ₹{totalExpense.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <div className="card py-3 flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-xs text-gray-500">Total Income</p>
              <p className="text-lg font-bold text-green-600">
                ₹{totalIncome.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="input-field pl-9 py-2 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'expense', 'income'].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                  ${filterType === t
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Koi expense nahi mila</p>
              <p className="text-sm mt-1">
                {search ? 'Search change karo' : 'Upar se add karo'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 px-2">
              {filtered.map(exp => (
                <ExpenseCard
                  key={exp._id}
                  expense={exp}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center 
                        z-50 px-4 py-6">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl 
                          max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editId ? 'Expense Edit Karo' : 'New Expense'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Type Toggle */}
              <div className="flex rounded-lg border border-gray-200 p-1 gap-1">
                {['expense', 'income'].map(t => (
                  <button key={t} type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-2 rounded-md text-sm font-medium capitalize 
                                transition-colors
                      ${form.type === t
                        ? t === 'expense'
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                        : 'text-gray-500 hover:bg-gray-50'}`}>
                    {t === 'expense' ? '💸 Expense' : '💰 Income'}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Lunch, Petrol..."
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="0"
                  min="1"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.name} type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg 
                                  border-2 transition-all text-xs font-medium
                        ${form.category?.name === cat.name
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                      <span className="text-xl">{cat.emoji}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (optional)
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={2}
                  placeholder="add some note.."
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving
                    ? <span className="animate-spin h-4 w-4 border-2 border-white 
                                       border-t-transparent rounded-full" />
                    : editId ? 'Update Karo' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
