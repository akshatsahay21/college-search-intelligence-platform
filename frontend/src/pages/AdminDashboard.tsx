import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  FileText,
  RefreshCw,
  CheckCircle,
  Loader2,
  Building2,
} from 'lucide-react';
import { api, getStoredUser } from '../services/api';
import UserAvatar from '../components/UserAvatar';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);
  const [reindexMessage, setReindexMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const adminUser = getStoredUser();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [anaRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
      ]);
      setAnalytics(anaRes.data);
      setUsers(usersRes.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReindex = async () => {
    if (!window.confirm('Trigger full Inverted Index rebuild across all document chunks?')) return;
    try {
      setReindexing(true);
      setReindexMessage(null);
      const res = await api.post('/admin/reindex');
      setReindexMessage(res.data.message);
      await fetchData();
    } catch (err: any) {
      alert('Reindex error: ' + (err.response?.data?.error || err.message));
    } finally {
      setReindexing(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put('/admin/user-role', { userId, role: newRole });
      await fetchData();
    } catch (err: any) {
      alert('Failed to update role: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Grand Campus Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 min-h-[260px] flex flex-col justify-end p-5 sm:p-7 border border-slate-700/60 bg-slate-950">
        <img
          src="/campus-banner.jpg"
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover object-[center_25%] filter brightness-70 contrast-110"
        />
        {/* Multi-layer Deep Scrim for Guaranteed Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/35" />
        <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          {/* Frosted Glass Identity Capsule */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 bg-slate-950/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 shadow-2xl max-w-3xl">
            <UserAvatar
              src={adminUser?.avatar}
              name={adminUser?.name || 'System Admin'}
              role="ADMIN"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/80 shadow-2xl object-cover ring-2 ring-purple-500/40 shrink-0"
              size="lg"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="badge-genz bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[10px] font-bold tracking-wider">
                  ⚡ Super Admin Control Center
                </span>
                <span className="text-xs text-white font-mono bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-lg shadow-xs">
                  Central Campus IT
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                {adminUser?.name || 'System Administration'}
              </h1>
              <div className="text-white text-xs sm:text-sm mt-1.5 font-semibold flex flex-wrap items-center gap-2 drop-shadow-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-xs text-white border border-white/20 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                  University Search Telemetry • System Analytics • Information Retrieval Engine
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleReindex}
            disabled={reindexing}
            className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 text-xs transition-all disabled:opacity-50 self-end lg:self-end cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${reindexing ? 'animate-spin' : ''}`} />
            {reindexing ? 'Rebuilding Postings Lists...' : 'Rebuild Inverted Index'}
          </button>
        </div>
      </div>

      {reindexMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{reindexMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          User & Role Management ({users.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Loading platform telemetry metrics...</p>
        </div>
      ) : activeTab === 'overview' ? (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-indigo-600">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Users
              </div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {analytics?.metrics?.totalUsers || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {analytics?.metrics?.studentCount} Students • {analytics?.metrics?.facultyCount}{' '}
                Faculty
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-blue-600">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Documents
              </div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {analytics?.metrics?.totalDocs || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Verified Materials</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-purple-600">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Vector Chunks
              </div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {analytics?.metrics?.totalChunks || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Inverted Index entries</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-amber-500">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Queries Logged
              </div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {analytics?.metrics?.totalSearches || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Hybrid search queries</div>
            </div>
          </div>

          {/* Recent Uploads Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Recent Documents Added to Index
            </h3>
            <div className="divide-y divide-slate-100">
              {analytics?.recentUploads?.map((doc: any) => (
                <div key={doc._id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{doc.title}</div>
                    <div className="text-xs text-slate-400">
                      {doc.type} • {doc.department} • {doc.uploaderName || 'Faculty'}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {doc.viewsCount || 0} views • {doc.downloadsCount || 0} dl
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Users Table with Complete Academic Records from MongoDB */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">User Profile</th>
                  <th className="pb-3 font-bold">Email</th>
                  <th className="pb-3 font-bold">ID / Roll No</th>
                  <th className="pb-3 font-bold">Academic Info</th>
                  <th className="pb-3 font-bold">Current Role</th>
                  <th className="pb-3 font-bold">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                      <UserAvatar
                        src={u.avatar}
                        name={u.name}
                        role={u.role}
                        className="w-8 h-8 rounded-full border border-slate-200 shrink-0 object-cover shadow-xs"
                        size="sm"
                      />
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {u.department || 'General'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3.5 font-mono font-bold text-indigo-700">
                      {u.rollNumber || u.employeeId || '—'}
                    </td>
                    <td className="py-3.5 text-slate-600">
                      {u.role === 'STUDENT' ? (
                        <span>Sem {u.semester || '—'} • Batch {u.batch || '—'}</span>
                      ) : u.role === 'FACULTY' ? (
                        <span>{u.designation || 'Faculty'} • {u.specialization || 'Dept'}</span>
                      ) : (
                        <span>System Admin</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`badge-genz text-[10px] ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'FACULTY'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="FACULTY">FACULTY</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
