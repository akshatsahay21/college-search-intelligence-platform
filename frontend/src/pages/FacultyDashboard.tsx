import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  FileText,
  Eye,
  Download,
  Trash2,
  School,
  Loader2,
  PlusCircle,
  Edit3,
  UserCheck,
  CheckCircle,
  X,
  Building,
  Briefcase,
  Building2,
  Camera,
} from 'lucide-react';
import { api, getStoredUser, setSession } from '../services/api';
import UserAvatar from '../components/UserAvatar';
import AvatarUploadField from '../components/AvatarUploadField';

export default function FacultyDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Faculty Profile State
  const [showEditModal, setShowEditModal] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Associate Professor');
  const [specialization, setSpecialization] = useState('Database Systems');
  const [officeRoom, setOfficeRoom] = useState('Block B, Room 304');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  const [currentFaculty, setCurrentFaculty] = useState<any | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faculty/dashboard');
      setData(res.data);

      const meRes = await api.get('/auth/me');
      if (meRes.data.user) {
        setCurrentFaculty(meRes.data.user);
        setEmployeeId(meRes.data.user.employeeId || '');
        setDesignation(meRes.data.user.designation || 'Associate Professor');
        setSpecialization(meRes.data.user.specialization || 'Database Management Systems');
        setOfficeRoom(meRes.data.user.officeRoom || 'Academic Block B, Room 304');
        setPhoneNumber(meRes.data.user.phoneNumber || '');
        setBio(meRes.data.user.bio || '');
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

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document from the search index?')) return;
    try {
      setDeletingId(docId);
      await api.delete(`/documents/${docId}`);
      await fetchDashboard();
    } catch (err: any) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedMsg(false);

    try {
      const res = await api.put('/auth/profile', {
        employeeId,
        designation,
        specialization,
        officeRoom,
        phoneNumber,
        bio,
      });

      setCurrentFaculty(res.data.user);
      const token = sessionStorage.getItem('token') || '';
      setSession(token, res.data.user);

      setProfileSavedMsg(true);
      setTimeout(() => {
        setProfileSavedMsg(false);
        setShowEditModal(false);
      }, 1200);
    } catch (err: any) {
      alert('Failed to update faculty profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingProfile(false);
    }
  };

  const facultyInfo = currentFaculty || getStoredUser();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Grand Campus Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 min-h-[280px] flex flex-col justify-end p-5 sm:p-7 border border-slate-700/60 bg-slate-950">
        <img
          src="/campus-banner.jpg"
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%] filter brightness-95 contrast-105"
        />
        {/* Ambient Sunlight & Subtle Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-slate-950/20 to-transparent" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          {/* Frosted Glass Identity Capsule */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 bg-slate-950/45 hover:bg-slate-950/55 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 shadow-2xl max-w-3xl transition-colors">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => setShowEditModal(true)}
              title="Click to Change Profile Photo"
            >
              <UserAvatar
                src={facultyInfo?.avatar}
                name={facultyInfo?.name || 'Faculty Member'}
                role="FACULTY"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/80 shadow-2xl object-cover ring-2 ring-blue-500/40"
                size="lg"
              />
              <div className="absolute inset-0 bg-black/55 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="badge-genz bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[10px] font-bold tracking-wider">
                  👨‍🏫 Faculty Member
                </span>
                <span className="text-xs text-white font-mono bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-lg shadow-xs">
                  ID: {facultyInfo?.employeeId || 'FAC-CSE-042'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                {facultyInfo?.name || 'Dr. Sarah Sharma'}
              </h1>

              <div className="text-white text-xs sm:text-sm mt-1.5 font-semibold flex flex-wrap items-center gap-2 drop-shadow-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-xs text-white border border-white/20 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  {facultyInfo?.designation || 'Associate Professor'} • {facultyInfo?.department || 'Computer Science & Engineering'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-white mt-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-900/60 backdrop-blur-xs text-blue-100 border border-blue-400/35 shadow-xs font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  {facultyInfo?.specialization || 'Database Management & Cloud Architecture'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 backdrop-blur-xs text-slate-100 border border-white/20 shadow-xs font-medium">
                  <Building className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  {facultyInfo?.officeRoom || 'Academic Block B, Room 304'}
                </span>
              </div>
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
              to="/faculty/upload"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Upload Material
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Loading faculty metrics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Uploaded Documents
                  </div>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {data?.facultyStats?.totalUploaded || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Active Course Files</div>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-600">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Student Views
                  </div>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {data?.facultyStats?.totalViews || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Passage impressions</div>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Document Downloads
                  </div>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {data?.facultyStats?.totalDownloads || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Verified Resource Downloads</div>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Download className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* My Uploads List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> My Uploaded Course Materials
                </h3>
                <p className="text-xs text-slate-400">
                  Fully indexed for student retrieval and academic search
                </p>
              </div>
            </div>

            {!data?.myDocuments || data.myDocuments.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-semibold text-sm">
                  You haven't uploaded any course documents yet.
                </p>
                <Link
                  to="/faculty/upload"
                  className="mt-3 inline-block text-xs font-bold text-blue-600 hover:underline"
                >
                  Upload your first syllabus, notes, or PYQ
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.myDocuments.map((doc: any) => (
                  <div
                    key={doc._id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-genz bg-indigo-100 text-indigo-800 text-[10px]">
                          {doc.type}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {doc.subject} • Sem {doc.semester || 'All'} • {doc.academicYear}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base">{doc.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.totalChunks || 0} chunks extracted • {doc.viewsCount || 0} views •{' '}
                        {doc.downloadsCount || 0} downloads
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:5000${doc.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        disabled={deletingId === doc._id}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        {deletingId === doc._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Faculty Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Edit Faculty Official Details
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
                  <span>Faculty profile updated successfully!</span>
                </div>
              )}

              {/* Profile Photo Upload Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Profile Photo
                </label>
                <AvatarUploadField
                  currentAvatar={facultyInfo?.avatar}
                  userName={facultyInfo?.name || 'Faculty Member'}
                  userRole="FACULTY"
                  onAvatarUpdated={(newUrl) => {
                    setFacultyInfo((prev: any) => ({ ...prev, avatar: newUrl }));
                    fetchDashboard();
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Employee ID Code
                </label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. FAC-CSE-042"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Designation
                </label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                  <option value="Head of Department">Head of Department (HOD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject Specialization
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Database Management & Cloud"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Office / Chamber Room
                </label>
                <input
                  type="text"
                  value={officeRoom}
                  onChange={(e) => setOfficeRoom(e.target.value)}
                  placeholder="e.g. Academic Block B, Room 304"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
    </div>
  );
}
