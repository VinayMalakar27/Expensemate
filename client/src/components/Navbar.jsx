import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart2, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses',  label: 'Expenses',  icon: Receipt },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logout ho gaye!');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">₹</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">ExpenseMate</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm 
                            font-medium transition-colors
                            ${pathname === to
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-600 hover:bg-gray-100'}`}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">
              Hi, <strong>{user?.name?.split(' ')[0]}</strong>
            </span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-600 
                         hover:text-red-600 transition-colors px-2 py-1.5 
                         rounded-lg hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden flex border-t border-gray-200">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs
                        font-medium transition-colors
                        ${pathname === to ? 'text-green-600' : 'text-gray-500'}`}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}