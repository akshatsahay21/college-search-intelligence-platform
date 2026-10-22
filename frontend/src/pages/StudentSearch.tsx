import { useState } from 'react';
import axios from 'axios';
import { Search, Sparkles, FileText, Loader2, GraduationCap } from 'lucide-react';

export default function StudentSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setAiAnswer(null);
    setResults([]);

    try {
      const response = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
      setResults(response.data.results || []);
      setAiAnswer(response.data.ai_answer || null);
    } catch (error) {
      console.error(error);
      alert('Search failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-4">College Intelligence Platform</h1>
        <p className="text-secondary text-lg">Ask any question to instantly search syllabi, notes, and PYQs.</p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-12 max-w-3xl mx-auto">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Explain the normalization process in DBMS..."
          className="w-full p-4 pl-14 pr-32 text-lg border-2 border-slate-200 rounded-full focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
        <button 
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ask AI'}
        </button>
      </form>

      {hasSearched && (
        <div className="space-y-8">
          {loading ? (
            <div className="text-center text-slate-500 py-16 animate-pulse">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-accent animate-spin" />
              <p className="text-lg font-medium">Scanning documents and generating an AI Overview...</p>
            </div>
          ) : (
            <>
              {/* AI Answer Panel */}
              {aiAnswer && (
                <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border-l-4 border-accent rounded-xl p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-accent">
                    <Sparkles className="w-6 h-6" />
                    <h2 className="font-bold text-xl text-primary">AI Overview</h2>
                  </div>
                  <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
                </div>
              )}

              {/* Source Documents */}
              <div className="pt-4">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Source Documents
                </h3>
                {results.length === 0 ? (
                  <p className="text-secondary text-center py-8 bg-white border border-slate-200 rounded-xl">
                    No relevant documents found. Try adjusting your search query.
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {results.map((r, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-200 cursor-pointer group">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-blue-50 group-hover:text-primary transition-colors">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-lg text-primary">{r.title || "Untitled Document"}</h4>
                              <span className="text-xs font-semibold text-accent bg-[#F8FAFC] border border-accent/20 px-3 py-1 rounded-full">
                                {r.explanation}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 font-medium">
                              <span className="uppercase px-2 py-0.5 bg-slate-100 rounded text-slate-600">{r.type}</span>
                              <span>•</span>
                              <span>Dept: <span className="text-slate-700">{r.department}</span></span>
                              {r.semester && (
                                <>
                                  <span>•</span>
                                  <span>Sem: <span className="text-slate-700">{r.semester}</span></span>
                                </>
                              )}
                              <span>•</span>
                              <span>Page: <span className="text-slate-700">{r.pageNumber}</span></span>
                            </div>
                            
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg text-slate-600 italic border-l-2 border-slate-200 line-clamp-3">
                              "{r.content}"
                            </div>
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
    </div>
  );
}
