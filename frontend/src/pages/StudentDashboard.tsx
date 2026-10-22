import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookMarked, Search, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/user/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDashboard();
  }, []);

  if (!data) return <div className="text-center mt-20 text-slate-500">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 mt-8">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Student Dashboard</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Saved Documents */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-accent" /> Saved Notes & PYQs
          </h2>
          {data.savedDocs.length === 0 ? (
            <p className="text-secondary text-sm">No documents saved yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.savedDocs.map((doc: any) => (
                <li key={doc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-primary">{doc.document.title}</span>
                  <span className="text-xs text-secondary bg-slate-200 px-2 py-1 rounded">{doc.document.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search History */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-accent" /> Recent Searches
          </h2>
          {data.searchHistory.length === 0 ? (
            <p className="text-secondary text-sm">No search history.</p>
          ) : (
            <ul className="space-y-3">
              {data.searchHistory.map((history: any) => (
                <li key={history.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-700">
                  "{history.query}"
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/search" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-blue-900 transition-colors shadow-md">
          <Search className="w-5 h-5" /> Ask AI a Question
        </Link>
      </div>
    </div>
  );
}
