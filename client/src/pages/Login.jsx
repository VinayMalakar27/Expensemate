import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock } from 'lucide-react';
import API from '../api/axios';
import useAuthStore from '../store/useAuthStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 
                    flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 
                          bg-green-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">₹</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ExpenseMate</h1>
          <p className="text-gray-500 mt-1">Track Your Expenses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="aap@example.com"
                className="input-field pl-10"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="input-field pl-10"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full 
                  flex items-center justify-center gap-2 py-2.5">
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white 
                               border-t-transparent rounded-full" />
            ) : (
              <><LogIn className="h-4 w-4" /> Login</>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
         Don't have an account?{' '}
          <Link to="/register" className="text-green-600 font-medium hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}