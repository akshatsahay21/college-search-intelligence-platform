import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  Send,
  Loader2,
  X,
  Copy,
  Check,
  School,
  FileText,
  HelpCircle,
  Bookmark,
} from 'lucide-react';
import { api } from '../services/api';

interface DocumentAIModalProps {
  documentId: string;
  documentTitle: string;
  subject?: string;
  department?: string;
  semester?: number | string;
  uploaderName?: string;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{ pageNumber: number; snippet: string }>;
}

export default function DocumentAIModal({
  documentId,
  documentTitle,
  subject,
  department,
  semester,
  uploaderName,
  onClose,
}: DocumentAIModalProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'qa'>('summary');
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Q&A State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Suggested Prompts
  const suggestedPrompts = [
    'Explain the core concepts of this document in simple terms.',
    'What are 5 important university exam questions from this note?',
    'Provide a quick 2-minute revision cheat-sheet of key definitions.',
    'What are the key takeaways and practical applications?',
  ];

  // Fetch Summary on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        setLoadingSummary(true);
        setSummaryError(null);
        const res = await api.get(`/documents/${documentId}/summary`);
        if (isMounted) {
          setSummary(res.data.summary);
        }
      } catch (err: any) {
        if (isMounted) {
          setSummaryError(
            err.response?.data?.error || 'Failed to generate AI summary. Please try again.'
          );
        }
      } finally {
        if (isMounted) {
          setLoadingSummary(false);
        }
      }
    };

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [documentId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'qa') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, asking]);

  const handleCopySummary = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendQuestion = async (qToSend?: string) => {
    const q = (qToSend || inputQuestion).trim();
    if (!q || asking) return;

    const userMessage: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion('');
    setAsking(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post(`/documents/${documentId}/ask`, {
        question: q,
        history: historyPayload,
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: res.data.answer,
        citations: res.data.citations,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ Failed to generate answer: ' +
            (err.response?.data?.error || err.message || 'Please try again.'),
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  // Helper to format markdown nicely with clean headings, bullets, and citations
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl sm:text-2xl font-black text-slate-900 mt-4 mb-2 tracking-tight">
            {line.replace('# ', '')}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-base sm:text-lg font-extrabold text-indigo-900 mt-5 mb-2 pb-1 border-b border-indigo-100 flex items-center gap-2"
          >
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm sm:text-base font-bold text-slate-800 mt-3 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
        const itemContent = line.replace(/^[-•*]\s*/, '');
        return (
          <li key={idx} className="ml-5 list-disc text-xs sm:text-sm text-slate-700 my-1 leading-relaxed">
            {renderBoldText(itemContent)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed my-1">
          {renderBoldText(line)}
        </p>
      );
    });
  };

  // Helper for bold text parsing
  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] max-h-[800px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl glow-gradient flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="badge-genz bg-indigo-100 text-indigo-800 text-[10px]">
                  🎓 AI Academic Tutor
                </span>
                {subject && (
                  <span className="badge-genz bg-slate-200/80 text-slate-700 text-[10px]">
                    {subject}
                  </span>
                )}
                {semester && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    Sem {semester}
                  </span>
                )}
              </div>
              <h2 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                {documentTitle}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <School className="w-3.5 h-3.5 text-blue-600" />
                <span>Uploaded by {uploaderName || 'Faculty Member'}</span>
                {department && <span>• {department}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Detailed AI Study Guide & Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`py-2.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'qa'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Questions (Grounded Q&A)</span>
            {messages.length > 0 && (
              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-full text-[10px]">
                {messages.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* TAB 1: Detailed Summary */}
          {activeTab === 'summary' && (
            <div>
              {loadingSummary ? (
                <div className="py-24 text-center">
                  <div className="w-12 h-12 rounded-2xl glow-gradient flex items-center justify-center text-white mx-auto mb-4 animate-bounce">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Synthesizing Detailed Document Summary...
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Analyzing all pages, extracting core formulas, definitions, and compiling a comprehensive
                    multi-page study guide with AI.
                  </p>
                </div>
              ) : summaryError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm">
                  ⚠️ {summaryError}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Control Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Generated strictly from faculty lecture notes • Verified context
                    </span>
                    <button
                      onClick={handleCopySummary}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Study Guide
                        </>
                      )}
                    </button>
                  </div>

                  {/* Summary Content Card */}
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs prose max-w-none">
                    {summary ? renderFormattedMarkdown(summary) : <p>No summary available.</p>}
                  </div>

                  {/* Call to Action: Switch to QA */}
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-indigo-900">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                      <span className="text-xs font-semibold">
                        Have questions about specific topics in this note? Chat directly with the AI
                        tutor!
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('qa')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                    >
                      Ask AI a Question →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Grounded Q&A */}
          {activeTab === 'qa' && (
            <div className="flex flex-col h-full space-y-4">
              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {messages.length === 0 ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        Ask Any Question from "{documentTitle}"
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        The AI will answer strictly using the content and formulas in this document with
                        exact page citations.
                      </p>
                    </div>

                    {/* Suggested Question Chips */}
                    <div className="pt-2 text-left max-w-xl mx-auto space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Suggested Inquiries:
                      </div>
                      <div className="flex flex-col gap-2">
                        {suggestedPrompts.map((p, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendQuestion(p)}
                            className="p-3 text-left bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-medium text-slate-700 hover:text-indigo-800 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                          >
                            <span>{p}</span>
                            <Sparkles className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm ${
                          m.role === 'user'
                            ? 'bg-indigo-600 text-white font-medium rounded-br-xs shadow-sm'
                            : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-xs leading-relaxed space-y-2'
                        }`}
                      >
                        {m.role === 'assistant' ? (
                          <>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 mb-1 pb-1 border-b border-slate-100">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>AI Academic Answer</span>
                            </div>
                            <div className="whitespace-pre-wrap">{renderFormattedMarkdown(m.content)}</div>
                            {m.citations && m.citations.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                  Cited Pages:
                                </span>
                                {m.citations.map((c, cIdx) => (
                                  <span
                                    key={cIdx}
                                    className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-200"
                                    title={c.snippet}
                                  >
                                    Page {c.pageNumber}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <span>{m.content}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {asking && (
                  <div className="flex items-start gap-2">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Reading document and formulating grounded answer...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuestion();
                }}
                className="pt-2 border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder={`Ask anything about "${documentTitle}"...`}
                  className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={asking || !inputQuestion.trim()}
                  className="p-3 glow-gradient text-white font-bold rounded-2xl shadow-md shadow-indigo-500/25 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

