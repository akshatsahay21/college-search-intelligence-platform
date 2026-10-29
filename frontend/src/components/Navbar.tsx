import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Upload,
  ShieldAlert,
  Brain,
  LogOut,
  Search,
  LayoutDashboard,
} from 'lucide-react';
import { getStoredUser, clearSession } from '../services/api';
import UserAvatar from './UserAvatar';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  useEffect(() => {
    const handleUpdate = () => setCurrentUser(getStoredUser());
    window.addEventListener('user-profile-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('user-profile-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const user = currentUser;

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link to={user ? (user.role === 'ADMIN' ? '/admin' : user.role === 'FACULTY' ? '/faculty' : '/dashboard') : '/login'} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl glow-gradient flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-900 via-indigo-700 to-blue-600 bg-clip-text text-transparent">
                CollegeIntel<span className="text-amber-500">.ai</span>
              </div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 -mt-1">
                Academic Intelligence Platform
              </div>
            </div>
          </Link>

          {/* Navigation Links according to Role */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/search"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                isActive('/search')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4 text-indigo-500" /> Search Documents
            </Link>

            {user?.role === 'STUDENT' && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" /> My Library
                </Link>
                <Link
                  to="/quiz"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/quiz')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Brain className="w-4 h-4 text-purple-500" /> AI Quiz
                </Link>
              </>
            )}

            {user?.role === 'FACULTY' && (
              <>
                <Link
                  to="/faculty"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/faculty')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-500" /> Faculty Portal
                </Link>
                <Link
                  to="/faculty/upload"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/faculty/upload')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Upload className="w-4 h-4 text-blue-500" /> Upload Course Material
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/admin')
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-purple-600" /> Admin Command
                </Link>
                <Link
                  to="/faculty/upload"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/faculty/upload')
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Upload className="w-4 h-4 text-purple-500" /> Upload Docs
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Action / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Role Badge */}
              <div
                className={`badge-genz ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : user.role === 'FACULTY'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                }`}
              >
                {user.role === 'ADMIN' && '⚡ Admin'}
                {user.role === 'FACULTY' && '👨‍🏫 Faculty'}
                {user.role === 'STUDENT' && '🎓 Student'}
              </div>

              {/* User Avatar & Name */}
              <div className="flex items-center gap-2">
                <UserAvatar
                  src={user.avatar}
                  name={user.name}
                  role={user.role}
                  className="w-8 h-8 rounded-full border border-indigo-200 shadow-xs object-cover"
                  size="sm"
                />
                <span className="hidden sm:inline-block text-sm font-semibold text-slate-700 max-w-[130px] truncate">
                  {user.name}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white glow-gradient rounded-xl shadow-sm hover:opacity-95 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
