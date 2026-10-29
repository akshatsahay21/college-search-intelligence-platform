import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  History,
  FileText,
  Search,
  Trash2,
  ExternalLink,
  Download,
  Sparkles,
  GraduationCap,
  Loader2,
  Edit3,
  UserCheck,
  CheckCircle,
  X,
  Building2,
  School,
  HelpCircle,
  Camera,
} from 'lucide-react';
import { api, getStoredUser, setSession } from '../services/api';
import DocumentAIModal from '../components/DocumentAIModal';
import UserAvatar from '../components/UserAvatar';
import AvatarUploadField from '../components/AvatarUploadField';

export default function StudentDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any | null>(null);

  // Tab State: 'materials' (Faculty Course Materials) vs 'saved' (My Saved Notes)
  const [activeDashboardTab, setActiveDashboardTab] = useState<'materials' | 'saved'>('materials');
  const [deptFilter, setDeptFilter] = useState<'all' | 'myDept'>('all');
  const [selectedDocForAI, setSelectedDocForAI] = useState<any | null>(null);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [semester, setSemester] = useState(6);
  const [batch, setBatch] = useState('2023-2027');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  const user = getStoredUser();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/dashboard');
      setData(res.data);
      if (res.data.userProfile) {
        setUserProfile(res.data.userProfile);
        setRollNumber(res.data.userProfile.rollNumber || '');
        setSemester(res.data.userProfile.semester || 6);
        setBatch(res.data.userProfile.batch || '2023-2027');
        setPhoneNumber(res.data.userProfile.phoneNumber || '');
        setBio(res.data.userProfile.bio || '');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRemoveBookmark = async (docId: string) => {
    try {
      await api.post('/user/save', { documentId: docId });
      fetchDashboard();
    } catch (err: any) {
      alert('Failed to remove bookmark');
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.delete('/user/history');
      fetchDashboard();
    } catch (err: any) {
      alert('Failed to clear history');
    }
  };

  const handleDownloadDoc = async (doc: any) => {
    try {
      const docId = doc._id || doc.documentId || doc.id;
      if (docId) {
        await api.post(`/documents/${docId}/download`).catch(() => {});
      }
      const url = doc.fileUrl?.startsWith('http') ? doc.fileUrl : `http://localhost:5000${doc.fileUrl}`;
      window.open(url, '_blank');
    } catch {
      window.open(doc.fileUrl, '_blank');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedMsg(false);

    try {
      const res = await api.put('/auth/profile', {
        rollNumber,
        semester: Number(semester),
        batch,
        phoneNumber,
        bio,
      });

      setUserProfile(res.data.user);
      const token = sessionStorage.getItem('token') || '';
      setSession(token, res.data.user);

      setProfileSavedMsg(true);
      setTimeout(() => {
        setProfileSavedMsg(false);
        setShowEditModal(false);
      }, 1200);
    } catch (err: any) {
      alert('Failed to update profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingProfile(false);
    }
  };

  const activeProfile = userProfile || user;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Grand University Campus Banner Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 min-h-[280px] flex flex-col justify-end p-5 sm:p-7 border border-slate-700/60 bg-slate-950">
        {/* University Building Image */}
        <img
          src="/campus-banner.jpg"
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover object-[center_25%] filter brightness-70 contrast-110"
        />

        {/* Multi-layer Deep Scrim for Guaranteed Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/35" />
        <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]" />

        {/* Content over Banner */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          {/* Frosted Glass Identity Capsule */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 bg-slate-950/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 shadow-2xl max-w-3xl">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => setShowEditModal(true)}
              title="Click to Change Profile Photo"
            >
              <UserAvatar
                src={activeProfile?.avatar}
                name={activeProfile?.name || 'Student'}
                role="STUDENT"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/80 shadow-2xl object-cover ring-2 ring-indigo-500/40"
                size="lg"
              />
              <div className="absolute inset-0 bg-black/55 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="badge-genz bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[10px] font-bold tracking-wider">
                  🎓 Student Scholar
                </span>
                <span className="text-xs text-white font-mono bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-lg shadow-xs">
                  Roll No: {activeProfile?.rollNumber || '22CSE104'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                {activeProfile?.name || 'Alex Johnson'}
              </h1>

              <div className="text-white text-xs sm:text-sm mt-1.5 font-semibold flex flex-wrap items-center gap-2 drop-shadow-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-xs text-white border border-white/20 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  {activeProfile?.department || 'Computer Science & Engineering'} • Semester {activeProfile?.semester || 6}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-900/60 backdrop-blur-xs text-indigo-100 border border-indigo-400/35 shadow-xs font-medium">
                  Batch {activeProfile?.batch || '2023-2027'}
                </span>
              </div>

              {activeProfile?.bio && (
                <p className="text-xs text-slate-200 mt-2 line-clamp-1 italic font-normal bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
                  "{activeProfile.bio}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end lg:self-end">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white border border-white/25 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Details
            </button>
            <Link
              to="/search"
              className="px-5 py-2.5 glow-gradient text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" /> Search Knowledge Base
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Loading your student workspace...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Controls: Faculty Materials vs Saved Notes */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveDashboardTab('materials')}
                  className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeDashboardTab === 'materials'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <School className="w-4 h-4" />
                  <span>Faculty Course Materials</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeDashboardTab === 'materials'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {data?.facultyUploads?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveDashboardTab('saved')}
                  className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeDashboardTab === 'saved'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Saved Notes & PYQs</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeDashboardTab === 'saved'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {data?.savedDocs?.length || 0}
                  </span>
                </button>
              </div>

              {/* Department Filter Toggle */}
              {activeDashboardTab === 'materials' && (
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setDeptFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      deptFilter === 'all'
                        ? 'bg-white text-indigo-700 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All Materials
                  </button>
                  <button
                    onClick={() => setDeptFilter('myDept')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      deptFilter === 'myDept'
                        ? 'bg-white text-indigo-700 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    My Branch ({activeProfile?.department?.slice(0, 3)?.toUpperCase() || 'CSE'})
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: Faculty Course Materials */}
            {activeDashboardTab === 'materials' && (
              <div className="space-y-4">
                {(!data?.facultyUploads ||
                  (deptFilter === 'myDept' && activeProfile?.department
                    ? data.facultyUploads.filter((d: any) => d.department === activeProfile.department).length === 0
                    : data.facultyUploads.length === 0)) ? (
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
                    <School className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-700 font-bold text-sm">No course materials found for this filter.</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Faculty course notes and study guides will appear here once uploaded by professors.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(deptFilter === 'myDept' && activeProfile?.department
                      ? data.facultyUploads.filter((d: any) => d.department === activeProfile.department)
                      : data.facultyUploads
                    ).map((doc: any) => {
                      const isSaved = (data?.savedDocs || []).some((s: any) => s._id === doc._id);
                      return (
                        <div
                          key={doc._id}
                          className="glass-card rounded-2xl p-5 border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition-all group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="badge-genz bg-indigo-100 text-indigo-800 text-[10px]">
                                {doc.type}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400">
                                {doc.department?.slice(0, 3)?.toUpperCase()} • Sem {doc.semester || 'All'}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              {doc.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{doc.subject}</p>

                            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                              <School className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="line-clamp-1">
                                Uploaded by {doc.uploaderName || doc.uploadedBy?.name || 'Faculty Member'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setSelectedDocForAI(doc)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Ask AI</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleRemoveBookmark(doc._id)}
                                title={isSaved ? 'Remove from Saved' : 'Save to Library'}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  isSaved
                                    ? 'bg-amber-50 text-amber-600 border-amber-300'
                                    : 'bg-white text-slate-400 border-slate-200 hover:text-amber-600 hover:border-amber-200'
                                }`}
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDownloadDoc(doc)}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>View PDF</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Saved Notes & PYQs */}
            {activeDashboardTab === 'saved' && (
              <div>
                {!data?.savedDocs || data.savedDocs.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
                    <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-700 font-bold text-sm">No saved materials yet.</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Click the bookmark icon on any course material or search result to save it for quick revision.
                    </p>
                    <button
                      onClick={() => setActiveDashboardTab('materials')}
                      className="mt-4 inline-block text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Browse Faculty Course Materials
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.savedDocs.map((doc: any) => (
                      <div
                        key={doc._id}
                        className="glass-card rounded-2xl p-5 border border-slate-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="badge-genz bg-indigo-100 text-indigo-800 text-[10px]">
                              {doc.type}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              Sem {doc.semester || 'All'}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                            {doc.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 font-medium">{doc.subject}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedDocForAI(doc)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Ask AI</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDownloadDoc(doc)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View PDF
                            </button>
                            <button
                              onClick={() => handleRemoveBookmark(doc._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove Bookmark"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search History Column (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-600" /> Recent Search Queries
              </h3>
              {data?.searchHistory?.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              {!data?.searchHistory || data.searchHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recent queries yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.searchHistory.map((h: any) => (
                    <Link
                      key={h._id}
                      to={`/search?q=${encodeURIComponent(h.query)}`}
                      className="py-3 flex items-center justify-between hover:text-indigo-600 transition-colors group block"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                          "{h.query}"
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(h.createdAt).toLocaleDateString()} • {h.resultsCount} passages
                        </div>
                      </div>
                      <Search className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Edit Academic Information
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              {profileSavedMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Academic details updated successfully!</span>
                </div>
              )}

              {/* Profile Photo Upload Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Profile Photo
                </label>
                <AvatarUploadField
                  currentAvatar={activeProfile?.avatar}
                  userName={activeProfile?.name || 'Student'}
                  userRole="STUDENT"
                  onAvatarUpdated={(newUrl) => {
                    setUserProfile((prev: any) => ({ ...prev, avatar: newUrl }));
                    fetchDashboard();
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 22CSE104"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Batch
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="2023-2027"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Academic Bio / Interests
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Preparing for GATE CSE and campus placements."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 glow-gradient text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Document Study Guide & Interactive Q&A Modal */}
      {selectedDocForAI && (
        <DocumentAIModal
          documentId={selectedDocForAI._id}
          documentTitle={selectedDocForAI.title}
          subject={selectedDocForAI.subject}
          department={selectedDocForAI.department}
          semester={selectedDocForAI.semester}
          uploaderName={selectedDocForAI.uploaderName || selectedDocForAI.uploadedBy?.name}
          onClose={() => setSelectedDocForAI(null)}
        />
      )}
    </div>
  );
}
