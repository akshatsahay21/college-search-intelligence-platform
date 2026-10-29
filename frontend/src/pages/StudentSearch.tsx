import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  FileText,
  Loader2,
  Bookmark,
  Download,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  BookMarked,
  HelpCircle,
  X,
  FileCheck,
  School,
} from 'lucide-react';
import { api, getStoredUser } from '../services/api';
import DocumentAIModal from '../components/DocumentAIModal';

export default function StudentSearch() {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'hybrid' | 'bm25' | 'semantic'>('hybrid');
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState('All');
  const [docType, setDocType] = useState('All');

  // AI Document Assistant Modal
  const [selectedDocForAI, setSelectedDocForAI] = useState<any | null>(null);

  // Search Results & AI State
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiCitations, setAiCitations] = useState<any[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [savedChunkIds, setSavedChunkIds] = useState<Set<string>>(new Set());

  // Autocomplete Suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // PDF Preview Modal
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // Tunable Weights Inspector
  const [showWeightsModal, setShowWeightsModal] = useState(false);
  const [wBm25, setWBm25] = useState(0.45);
  const [wSem, setWSem] = useState(0.35);
  const [wPop, setWPop] = useState(0.1);
  const [wFresh, setWFresh] = useState(0.1);

  const user = getStoredUser();

  // Recent Faculty Course Materials & Quick Prompts
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const quickPrompts = [
    'Explain DBMS normalization with 3NF',
    'Process scheduling algorithms in OS (SJF vs Round Robin)',
    'TCP 3-Way Handshake and connection state',
    'B-Trees vs B+ Trees database indexing',
    'Paging and Virtual Memory page fault handling',
    'Previous Year Questions on Transaction ACID properties',
  ];

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoadingRecent(true);
        const res = await api.get('/documents?sort=desc');
        setRecentDocs(res.data.documents?.slice(0, 6) || []);
      } catch (err) {
        console.error('Failed to load recent docs:', err);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecent();
  }, []);

  // Autocomplete fetch on query change
  useEffect(() => {
    if (query.trim().length >= 2 && !hasSearched) {
      const timer = setTimeout(async () => {
        try {
          const res = await api.get(`/search/autocomplete?q=${encodeURIComponent(query.trim())}`);
          setSuggestions(res.data.suggestions || []);
          setShowSuggestions(true);
        } catch {
          setSuggestions([]);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, hasSearched]);

  const executeSearch = async (overrideQuery?: string) => {
    const q = overrideQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setShowSuggestions(false);
    setAiAnswer(null);
    setAiCitations([]);

    try {
      const params = new URLSearchParams({
        q: q.trim(),
        mode: searchMode,
        department,
        semester,
        type: docType,
        w_bm25: wBm25.toString(),
        w_sem: wSem.toString(),
        w_pop: wPop.toString(),
        w_fresh: wFresh.toString(),
      });

      const res = await api.get(`/search?${params.toString()}`);
      setResults(res.data.results || []);
      setAiAnswer(res.data.ai_answer || null);
      setAiCitations(res.data.ai_citations || []);
      setLatencyMs(res.data.latencyMs || null);
    } catch (err: any) {
      console.error(err);
      alert('Search failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    setShowSuggestions(false);
    executeSearch(text);
  };

  const handleToggleBookmark = async (docId: string) => {
    try {
      const res = await api.post('/user/save', { documentId: docId });
      setSavedChunkIds((prev) => {
        const next = new Set(prev);
        if (res.data.isSaved) next.add(docId);
        else next.delete(docId);
        return next;
      });
    } catch {
      alert('Please log in as a student to bookmark documents.');
    }
  };

  const handleOpenPreview = (item: any) => {
    setPreviewDoc(item);
    const docId = item._id || item.documentId || item.id;
    if (docId) {
      api.post(`/documents/${docId}/view`).catch(() => {});
    }
  };

  const handleDownload = async (doc: any) => {
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Search Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Grounded College Search
          Engine
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Find Any <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Note, PYQ or Syllabus</span>
        </h1>
        <p className="text-slate-500 text-base max-w-2xl mx-auto mt-2">
          Search your college resources using AI-powered hybrid search. Get relevant study materials,
          contextual answers, and source citations from your academic documents.
        </p>
      </div>

      {/* Main Search Bar & Suggestions */}
      <div className="relative max-w-3xl mx-auto mb-6">
        <form onSubmit={handleSearchSubmit} className="relative z-20">
          <div className="relative flex items-center">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
              placeholder="e.g., Explain DBMS normalization with 3NF or 2025 Placement criteria..."
              className="w-full py-4 pl-13 pr-36 text-base sm:text-lg bg-white border-2 border-slate-200 rounded-3xl shadow-lg shadow-indigo-500/5 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-slate-800"
            />
            <Search className="absolute left-4.5 text-slate-400 w-5 h-5 pointer-events-none" />

            {/* Clear Query button */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHasSearched(false);
                }}
                className="absolute right-28 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 py-2.5 px-5 glow-gradient text-white font-bold rounded-2xl shadow-sm hover:opacity-95 transition-all text-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Ask AI</span>
            </button>
          </div>
        </form>

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden divide-y divide-slate-100">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(s.text)}
                className="w-full px-5 py-3 text-left hover:bg-indigo-50/70 flex items-center justify-between text-sm transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-900">
                    {s.text}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                  {s.detail}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Controls: Search Modes & Filter Chips */}
      <div className="max-w-4xl mx-auto space-y-4 mb-10">
        {/* Mode Selector & Weights Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span className="mr-1">IR Mode:</span>
            <button
              onClick={() => setSearchMode('hybrid')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                searchMode === 'hybrid'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ⚡ Hybrid (BM25 + Dense)
            </button>
            <button
              onClick={() => setSearchMode('bm25')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                searchMode === 'bm25'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🔍 Inverted Index (BM25)
            </button>
            <button
              onClick={() => setSearchMode('semantic')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                searchMode === 'semantic'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🧠 Vector Embedding
            </button>
          </div>

          {/* Tunable Weights Formula Button */}
          <button
            onClick={() => setShowWeightsModal(!showWeightsModal)}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Tune Formula Weights</span>
          </button>
        </div>

        {/* Weights Sliders Popover */}
        {showWeightsModal && (
          <div className="p-4 bg-indigo-950 text-white rounded-2xl shadow-xl space-y-3 text-xs animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-indigo-800 pb-2">
              <span className="font-extrabold uppercase tracking-wider text-indigo-300">
                Hybrid Scoring Formula (PDF Section 4)
              </span>
              <span className="text-amber-400 font-mono">
                Final = ({wBm25} × BM25) + ({wSem} × Sem) + ({wPop} × Pop) + ({wFresh} × Fresh)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <label className="block text-indigo-200 mb-1">BM25 Weight: {wBm25}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wBm25}
                  onChange={(e) => setWBm25(parseFloat(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>
              <div>
                <label className="block text-indigo-200 mb-1">Semantic Weight: {wSem}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wSem}
                  onChange={(e) => setWSem(parseFloat(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>
              <div>
                <label className="block text-indigo-200 mb-1">Popularity Weight: {wPop}</label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={wPop}
                  onChange={(e) => setWPop(parseFloat(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>
              <div>
                <label className="block text-indigo-200 mb-1">Freshness Weight: {wFresh}</label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={wFresh}
                  onChange={(e) => setWFresh(parseFloat(e.target.value))}
                  className="w-full accent-indigo-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Filter Tags (Document Type, Dept, Sem) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filters:
          </span>
          {[
            { label: 'All Docs', val: 'All' },
            { label: '🔥 PYQs', val: 'PYQ' },
            { label: '📚 Notes', val: 'NOTES' },
            { label: '⚡ Syllabus', val: 'SYLLABUS' },
            { label: '📢 Notices', val: 'NOTICE' },
            { label: '💼 Placements', val: 'PLACEMENT' },
          ].map((t) => (
            <button
              key={t.val}
              onClick={() => setDocType(t.val)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                docType === t.val
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}

          {/* Department Select */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="All">All Branches</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Information Technology">IT</option>
            <option value="Electronics & Communication">ECE</option>
            <option value="Mechanical Engineering">MECH</option>
            <option value="Civil Engineering">CIVIL</option>
          </select>

          {/* Semester Select */}
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="All">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Results & AI Overview */}
      {hasSearched && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Latency and Metrics Bar */}
          {latencyMs !== null && (
            <div className="flex items-center justify-between text-xs text-slate-500 px-2">
              <span>
                Found <strong className="text-slate-800">{results.length}</strong> relevant passages
                across college materials.
              </span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                ⚡ Retrieval Latency: {latencyMs} ms
              </span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <Sparkles className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">Searching College Knowledge Base...</h3>
              <p className="text-slate-500 text-sm mt-1">
                Applying inverted index postings, dense vector embeddings, and hybrid rank fusion.
              </p>
            </div>
          ) : (
            <>
              {/* Grounded AI Overview Panel */}
              {aiAnswer && (
                <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 shadow-lg shadow-indigo-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl glow-gradient flex items-center justify-center text-white">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">
                          Grounded AI Overview
                        </h2>
                        <span className="text-[11px] font-semibold text-indigo-600">
                          Strictly grounded in uploaded college course documents • Zero hallucination
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal">
                    {aiAnswer}
                  </div>

                  {/* Cited Sources Carousel / Chips */}
                  {aiCitations.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-slate-200/80">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Referenced College Sources & Pages:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiCitations.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => handleOpenPreview(c)}
                            className="px-3 py-1.5 bg-white border border-indigo-200 hover:border-indigo-400 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>
                              {c.documentTitle} <strong className="text-indigo-600">p.{c.pageNumber}</strong>
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Source Passages List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Ranked Document Passages
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    Sorted by Hybrid Ranking Score
                  </span>
                </div>

                {results.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
                    No matching documents found. Try adjusting query terms or clearing branch filters.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {results.map((r, idx) => (
                      <div
                        key={idx}
                        className="glass-card rounded-2xl p-5 sm:p-6 hover:border-indigo-300 transition-all group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Tags Bar */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="badge-genz bg-slate-900 text-white">
                                #{idx + 1} Ranked
                              </span>
                              <span className="badge-genz bg-indigo-100 text-indigo-800">
                                {r.documentType}
                              </span>
                              <span className="badge-genz bg-slate-100 text-slate-700">
                                {r.department}
                              </span>
                              {r.semester && (
                                <span className="badge-genz bg-purple-100 text-purple-800">
                                  Sem {r.semester}
                                </span>
                              )}
                              <span className="text-xs font-bold text-slate-400">
                                Page {r.pageNumber}
                              </span>
                            </div>

                            {/* Title */}
                            <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {r.documentTitle}
                            </h4>
                            <div className="text-xs font-semibold text-slate-500 mb-3">
                              Subject: <span className="text-slate-800">{r.subject}</span> • Year:{' '}
                              {r.academicYear}
                            </div>

                            {/* Snippet */}
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 font-mono">
                              "{r.content.slice(0, 320)}..."
                            </p>

                            {/* Score Breakdown Pills */}
                            <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] font-semibold text-slate-500">
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                                Final Score: <strong>{(r.finalScore * 100).toFixed(1)}%</strong>
                              </span>
                              <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                                BM25: {(r.bm25Score * 100).toFixed(0)}%
                              </span>
                              <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                                Vector Sim: {(r.semanticScore * 100).toFixed(0)}%
                              </span>
                              {r.matchedTerms?.length > 0 && (
                                <span className="text-indigo-600">
                                  Matched: [{r.matchedTerms.slice(0, 3).join(', ')}]
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex sm:flex-col items-center gap-2 self-end sm:self-start">
                            <button
                              onClick={() => handleToggleBookmark(r.documentId)}
                              title="Save to My Library"
                              className={`p-2.5 rounded-xl border transition-all ${
                                savedChunkIds.has(r.documentId)
                                  ? 'bg-amber-50 text-amber-600 border-amber-300'
                                  : 'bg-white text-slate-500 border-slate-200 hover:text-amber-600 hover:border-amber-200'
                              }`}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenPreview(r)}
                              title="Preview Document"
                              className="p-2.5 bg-white text-slate-500 border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDownload(r)}
                              title="Download PDF"
                              className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs hover:bg-indigo-700 transition-all"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Discovery Feed: Shown Before Search is Executed */}
      {!hasSearched && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Quick Academic Search Prompts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Trending Academic Inquiries
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(prompt);
                    executeSearch(prompt);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl text-xs font-medium text-slate-700 hover:text-indigo-700 transition-all flex items-center gap-2 shadow-xs cursor-pointer group"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Latest Faculty Course Materials */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <School className="w-5 h-5 text-indigo-600" /> Latest Faculty Course Materials
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified notes, question banks, and syllabi uploaded by professors across departments.
                </p>
              </div>
            </div>

            {loadingRecent ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading verified campus materials...</p>
              </div>
            ) : recentDocs.length === 0 ? (
              <div className="py-10 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No course documents uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentDocs.map((doc) => (
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
                          {doc.department.slice(0, 3).toUpperCase()} • Sem {doc.semester || 'All'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
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

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedDocForAI(doc)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Ask AI
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> View PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF / Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {previewDoc.documentTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Page {previewDoc.pageNumber} • {previewDoc.subject || 'Academic Document'}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
                💡 <strong>Citation Context:</strong> This excerpt was extracted, tokenized, and
                vectorized into the college search index.
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                {previewDoc.content || previewDoc.snippet}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Verified Campus Knowledge Repository
              </span>
              <button
                onClick={() => handleDownload(previewDoc)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Open Full Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Document Study Guide & Interactive Q&A Modal */}
      {selectedDocForAI && (
        <DocumentAIModal
          documentId={selectedDocForAI._id || selectedDocForAI.documentId}
          documentTitle={selectedDocForAI.title || selectedDocForAI.documentTitle}
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
