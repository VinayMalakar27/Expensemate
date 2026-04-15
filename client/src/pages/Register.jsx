import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import API from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/register', form);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 
                    flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 
                          bg-green-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">₹</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-1">Start tracking your expenses for free</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Name', icon: User, type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'john@example.com' },
            { key: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: '••••••••' },
          ].map(({ key, label, icon: Icon, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type={type}
                  placeholder={placeholder}
                  className="input-field pl-10"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required
                />
              </div>
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
            {loading
              ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              : <><UserPlus className="h-4 w-4" /> Register</>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
