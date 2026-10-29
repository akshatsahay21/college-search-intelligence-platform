import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  GraduationCap,
  School,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { api, setSession } from '../services/api';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'FACULTY' | 'ADMIN'>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'STUDENT' | 'FACULTY' | 'ADMIN') => {
    setSelectedRole(role);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (email.endsWith('@college.edu')) {
        await api.post('/auth/seed-demo').catch(() => {});
      }

      const response = await api.post('/auth/login', {
        email,
        password,
        expectedRole: selectedRole,
      });

      setSession(response.data.token, response.data.user);

      if (response.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (response.data.user.role === 'FACULTY') {
        navigate('/faculty');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Invalid credentials or user not found. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen min-h-screen max-h-screen overflow-hidden flex flex-col md:flex-row bg-white select-none relative">
      {/* ========================================================= */}
      {/* Left Column: Full-Height Edge-to-Edge Campus Visual Hero   */}
      {/* ========================================================= */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 xl:w-5/12 h-screen relative flex-col justify-between p-8 lg:p-14 text-white overflow-hidden bg-slate-950 flex-shrink-0">
        {/* Full Bleed Visual Photo */}
        <img
          src="/students-grad.jpg"
          alt="Campus Graduates"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95"
        />

        {/* Cinematic Deep Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-indigo-950/45" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl glow-gradient flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="font-black text-xl tracking-tight leading-none text-white">
              CollegeIntel<span className="text-amber-400">.ai</span>
            </div>
            <div className="text-[11px] text-indigo-200 font-semibold tracking-wider uppercase mt-1">
              Centralized Academic Knowledge Platform
            </div>
          </div>
        </div>

        {/* Bottom Hero Pitch */}
        <div className="relative z-10 space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 border border-white/20 text-xs font-bold tracking-wide">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic Excellence & Smart Retrieval</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
            Every Note, PYQ & Syllabus Grounded for You.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Accelerate your exam preparation with sub-second hybrid retrieval, verified faculty lecture
            slides, and previous year papers.
          </p>

          {/* Feature Highlights */}
          <div className="pt-2 grid grid-cols-1 gap-2.5 text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Custom Inverted Index & Robertson-Spärck Jones BM25</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Grounded RAG synthesis with direct page-level citations</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Role-Based Access Control for Students, Faculty & Admins</span>
            </div>
          </div>
        </div>

        {/* Ambient Footer */}
        <div className="relative z-10 text-[11px] text-slate-400 font-medium flex items-center justify-between border-t border-white/10 pt-4">
          <span>Digital Campus Intelligence Platform</span>
          <span>Official University Portal</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Right Column: Full-Height Clean Edge-to-Edge Form Pane    */}
      {/* ========================================================= */}
      <div className="w-full md:w-7/12 lg:w-1/2 xl:w-7/12 h-screen flex flex-col justify-between items-center bg-white p-6 sm:p-10 lg:p-16 overflow-y-auto md:overflow-hidden relative">
        {/* Subtle decorative background gradient blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

        {/* Top Mobile Brand Banner (visible on mobile only) */}
        <div className="w-full md:hidden flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl glow-gradient flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="font-black text-lg text-slate-900 leading-none">
              CollegeIntel<span className="text-indigo-600">.ai</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Academic Portal Sign In</div>
          </div>
        </div>

        {/* Centered Form Body */}
        <div className="w-full max-w-md my-auto py-2">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3">
              <GraduationCap className="w-4 h-4 text-indigo-600" /> Campus Single Sign-On
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Please enter your campus credentials to access your portal
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleRoleSelect('STUDENT')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'STUDENT'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('FACULTY')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'FACULTY'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <School className="w-4 h-4 text-blue-600" />
                <span>Faculty</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('ADMIN')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'ADMIN'
                    ? 'bg-white text-purple-700 shadow-sm border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-semibold leading-relaxed flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-5 glow-gradient text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In to {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()} Portal{' '}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Create Account Link */}
          <div className="mt-6 text-center text-xs sm:text-sm text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-indigo-600 hover:text-indigo-800 underline transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* Bottom Clean Footer */}
        <div className="w-full text-center text-xs text-slate-400 py-2 border-t border-slate-100">
          College Intelligence Knowledge Platform • Role-Based Authentication
        </div>
      </div>
    </div>
  );
}
