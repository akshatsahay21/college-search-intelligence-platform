import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  BookOpen,
  School,
  Shield,
  ArrowRight,
  Database,
  Cpu,
  Server,
} from 'lucide-react';

export default function Home() {
  const [heroQuery, setHeroQuery] = useState('');
  const navigate = useNavigate();

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Intelligent Academic Knowledge Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Centralized AI Search &{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
            Knowledge Platform
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Bringing syllabus documents, lecture notes, PYQs, placement circulars, and departmental
          notices into one smart, searchable system powered by custom IR & grounded GenAI.
        </p>

        {/* Hero Search Box */}
        <form onSubmit={handleHeroSearch} className="mt-8 max-w-2xl mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder="Search notes, PYQs, exam rules (e.g., 'DBMS 3NF normal form')..."
              className="w-full py-4.5 pl-14 pr-32 text-base bg-white border-2 border-slate-200 rounded-3xl shadow-xl shadow-indigo-500/5 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-slate-800"
            />
            <Search className="absolute left-5 text-slate-400 w-5 h-5 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2.5 py-2.5 px-5 glow-gradient text-white font-bold rounded-2xl shadow-sm hover:opacity-95 transition-all text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="font-semibold">Popular searches:</span>
          {['DBMS Normalization', 'OS Deadlock Avoidance', 'Placement 2026 Criteria', 'Computer Networks TCP'].map((t) => (
            <button
              key={t}
              onClick={() => navigate(`/search?q=${encodeURIComponent(t)}`)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* 3 Role Portals Cards */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tailored Portals for Every Campus Role
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Role-Based Access Control connecting Students, Faculty, and Administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-t-4 border-t-indigo-600">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">🎓 Student Portal</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                Sub-second keyword and semantic search, grounded AI summaries with page citations,
                bookmarking, and syllabus quiz generator.
              </p>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-2xl text-xs transition-colors"
            >
              Launch Student Search <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Faculty Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-t-4 border-t-blue-600">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">👨‍🏫 Faculty Portal</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                Upload course PDFs with structured metadata (Dept, Semester, Subject). Automatic text
                chunking, high-speed CDN delivery, and engagement telemetry.
              </p>
            </div>
            <Link
              to="/faculty"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl text-xs transition-colors"
            >
              Enter Faculty Hub <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Admin Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-t-4 border-t-purple-600">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">⚡ Super Admin</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                System-wide metrics, user role promotion, complete document control, and instant
                Inverted Index rebuilding across indexed documents.
              </p>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-2xl text-xs transition-colors"
            >
              Open Command Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Engineering Architecture Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              System Architecture & Core Engineering
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-8">
              Technical Capabilities & Architecture
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <Cpu className="w-8 h-8 text-indigo-400 mb-3" />
                <h4 className="font-extrabold text-lg mb-1">1. Custom Inverted Index (IR)</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Tokenization, stemming, stop-word removal, and full Robertson-Spärck Jones BM25 ranking.
                  High-efficiency postings lists for sub-second retrieval.
                </p>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <Database className="w-8 h-8 text-cyan-400 mb-3" />
                <h4 className="font-extrabold text-lg mb-1">2. Dense Vector & Hybrid Fusion</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Dense vectors and cosine similarity combined with keyword scores using tunable hybrid
                  ranking: 45% BM25 + 35% Vector + 10% Popularity + 10% Freshness.
                </p>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <Server className="w-8 h-8 text-purple-400 mb-3" />
                <h4 className="font-extrabold text-lg mb-1">3. Grounded RAG & Cloud Delivery</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Synthesizes answers strictly from retrieved passages with exact page citations, backed
                  by high-performance cloud CDN storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
