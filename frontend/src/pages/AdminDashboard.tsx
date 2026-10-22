import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, Search, Activity, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docsList, setDocsList] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error(error);
        navigate('/login');
      }
    };
    fetchStats();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsersList(res.data);
      setShowUsersModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDocs = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/documents', { headers: { Authorization: `Bearer ${token}` } });
      setDocsList(res.data);
      setShowDocsModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  if (!stats) return <div className="text-center mt-20 text-slate-500 font-medium">Loading analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 mt-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Analytics</h1>
          <p className="text-secondary mt-1">Platform overview and statistics</p>
        </div>
        <Link to="/admin/upload" className="bg-accent text-primary font-bold px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors shadow-md">
          Upload Document
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div onClick={fetchUsers} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all">
          <div className="p-4 bg-blue-50 text-primary rounded-xl"><Users className="w-8 h-8" /></div>
          <div>
            <p className="text-secondary font-medium">Total Users</p>
            <h2 className="text-3xl font-bold text-primary">{stats.totalUsers}</h2>
          </div>
        </div>
        
        <div onClick={fetchDocs} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md hover:border-green-200 transition-all">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl"><FileText className="w-8 h-8" /></div>
          <div>
            <p className="text-secondary font-medium">Processed Documents</p>
            <h2 className="text-3xl font-bold text-primary">{stats.totalDocs}</h2>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Search className="w-8 h-8" /></div>
          <div>
            <p className="text-secondary font-medium">Searches Performed</p>
            <h2 className="text-3xl font-bold text-primary">{stats.totalSearches}</h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent"/> Recently Uploaded Documents
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-secondary">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUploads.map((doc: any) => (
                <tr 
                  key={doc.id} 
                  className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => window.open(`http://localhost:5000/uploads/${doc.id}.pdf`, '_blank')}
                >
                  <td className="py-4 font-medium text-primary hover:underline">{doc.title}</td>
                  <td className="py-4 text-slate-600">{doc.department}</td>
                  <td className="py-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-sm uppercase font-semibold">{doc.type}</span></td>
                  <td className="py-4 text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-primary">Registered Users</h2>
              <button onClick={() => setShowUsersModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-secondary">
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user: any) => (
                    <tr key={user.id} className="border-b border-slate-100">
                      <td className="py-4 font-medium text-slate-800">{user.name}</td>
                      <td className="py-4 text-slate-600">{user.email}</td>
                      <td className="py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Docs Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-primary">All Processed Documents</h2>
              <button onClick={() => setShowDocsModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-secondary">
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Dept</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {docsList.map((doc: any) => (
                    <tr 
                      key={doc.id} 
                      className="border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => window.open(`http://localhost:5000/uploads/${doc.id}.pdf`, '_blank')}
                    >
                      <td className="py-4 font-medium text-primary hover:underline">{doc.title}</td>
                      <td className="py-4 text-slate-600">{doc.department}</td>
                      <td className="py-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-sm uppercase font-semibold">{doc.type}</span></td>
                      <td className="py-4 text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
