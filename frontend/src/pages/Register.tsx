import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  GraduationCap,
  School,
  ArrowRight,
  Loader2,
  User,
  Mail,
  Lock,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { api, setSession } from '../services/api';

export default function Register() {
  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Student specific details
  const [rollNumber, setRollNumber] = useState('');
  const [semester, setSemester] = useState(6);
  const [batch, setBatch] = useState('2023-2027');

  // Faculty specific details
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [specialization, setSpecialization] = useState('Database Systems');
  const [officeRoom, setOfficeRoom] = useState('Academic Block B, Room 304');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        name,
        email,
        password,
        role,
        department,
        phoneNumber,
      };

      if (role === 'STUDENT') {
        payload.rollNumber =
          rollNumber ||
          `23${department.slice(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
        payload.semester = Number(semester);
        payload.batch = batch;
      } else {
        payload.employeeId =
          employeeId ||
          `FAC-${department.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
        payload.designation = designation;
        payload.specialization = specialization;
        payload.officeRoom = officeRoom;
      }

      const response = await api.post('/auth/register', payload);
      setSession(response.data.token, response.data.user);

      if (role === 'FACULTY') {
        navigate('/faculty');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen min-h-screen overflow-hidden flex flex-col md:flex-row bg-white select-none relative">
      {/* ========================================================= */}
      {/* Left Column: Full-Height Edge-to-Edge Visual Hero          */}
      {/* ========================================================= */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 xl:w-5/12 h-screen relative flex-col justify-between p-8 lg:p-14 text-white overflow-hidden bg-slate-950 flex-shrink-0">
        <img
          src="/students-grad.jpg"
          alt="Campus Graduates"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95"
        />

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

        {/* Bottom Hero Copy */}
        <div className="relative z-10 space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 border border-white/20 text-xs font-bold tracking-wide">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Join Campus Academic Network</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
            Join Your Department’s Unified Academic Hub.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Create your official campus profile to bookmark verified study materials, inspect
            departmental syllabus nodes, and access instant AI-generated question banks.
          </p>

          <div className="pt-2 grid grid-cols-1 gap-2.5 text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Official student & faculty academic directory</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Instant high-speed verified lecture materials</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Personalized bookmarks, query history & performance tracking</span>
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
      <div className="w-full md:w-7/12 lg:w-1/2 xl:w-7/12 h-screen flex flex-col justify-between items-center bg-white p-6 sm:p-8 lg:p-12 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

        {/* Top Mobile Brand Banner */}
        <div className="w-full md:hidden flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl glow-gradient flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="font-black text-lg text-slate-900 leading-none">
              CollegeIntel<span className="text-indigo-600">.ai</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Create Campus Account</div>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-lg my-auto py-2">
          {/* Header */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> New Campus Profile
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Create Account
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Fill in your departmental details below to register
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Registering As
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  role === 'STUDENT'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('FACULTY')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  role === 'FACULTY'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <School className="w-4 h-4 text-blue-600" />
                <span>Faculty Member</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-semibold leading-relaxed flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Campus Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@college.edu"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
                <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
              </select>
            </div>

            {role === 'STUDENT' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 22CSE104"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. FAC-CSE-042"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designation
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Head of Department">Head of Department (HOD)</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 glow-gradient text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Profile...
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to login */}
          <div className="mt-4 text-center text-xs sm:text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-indigo-600 hover:text-indigo-800 underline transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Bottom Clean Footer */}
        <div className="w-full text-center text-xs text-slate-400 py-2 border-t border-slate-100">
          College Intelligence Knowledge Platform • Department Portal
        </div>
      </div>
    </div>
  );
}
