import { useState } from 'react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';

export default function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<any | null>(null);

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const quickTopics = [
    'DBMS Normalization (3NF & BCNF)',
    'Operating Systems Deadlocks & Bankers Algorithm',
    'Computer Networks TCP Handshake',
    'Binary Search Trees & AVL Balancing',
    'Software Engineering Agile & Scrum',
  ];

  const handleGenerate = async (selectedTopic?: string) => {
    const qTopic = selectedTopic || topic;
    if (!qTopic.trim()) return;

    setLoading(true);
    setQuizData(null);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowResults(false);

    try {
      const res = await api.post('/quiz/generate', {
        topic: qTopic,
        subject,
      });
      setQuizData(res.data);
    } catch (err: any) {
      alert('Quiz generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option: string) => {
    if (selectedAnswers[currentIdx]) return; // prevent changing after selecting
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: option }));
  };

  const handleNext = () => {
    if (currentIdx < (quizData?.questions?.length || 0) - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    if (!quizData?.questions) return 0;
    return quizData.questions.reduce((score: number, q: any, idx: number) => {
      return selectedAnswers[idx] === q.answer ? score + 1 : score;
    }, 0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-xs font-bold mb-3">
          <Brain className="w-3.5 h-3.5 text-purple-600" /> AI Knowledge Retention Check
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Syllabus-Grounded <span className="text-purple-600">Quiz Generator</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto mt-2">
          Test your conceptual understanding before university exams with questions dynamically
          synthesized from college notes.
        </p>
      </div>

      {!quizData && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Enter Subject or Topic
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Normalization, B-Trees, Virtual Memory..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate</span>
                </button>
              </div>
            </div>

            {/* Quick Topic Chips */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Or pick a popular semester topic:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickTopics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTopic(t);
                      handleGenerate(t);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-600 text-xs font-semibold rounded-xl transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Active Quiz Card */}
      {quizData && !showResults && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-purple-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <span className="badge-genz bg-purple-100 text-purple-800">
              Topic: {quizData.topic}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Question {currentIdx + 1} of {quizData.questions.length}
            </span>
          </div>

          {/* Question text */}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 leading-relaxed">
            {quizData.questions[currentIdx]?.question}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {quizData.questions[currentIdx]?.options.map((opt: string, optIdx: number) => {
              const selected = selectedAnswers[currentIdx];
              const isChosen = selected === opt;
              const isCorrect = opt === quizData.questions[currentIdx]?.answer;

              let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
              if (selected) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                } else if (isChosen) {
                  btnStyle = 'bg-rose-50 border-rose-400 text-rose-800 font-bold';
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selected && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {selected && isChosen && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation if answered */}
          {selectedAnswers[currentIdx] && (
            <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 text-xs text-purple-900 mb-6 leading-relaxed animate-in fade-in">
              💡 <strong>Academic Concept:</strong> {quizData.questions[currentIdx]?.explanation}
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentIdx]}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition-all disabled:opacity-40"
            >
              <span>{currentIdx < quizData.questions.length - 1 ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quiz Final Results Modal */}
      {showResults && (
        <div className="glass-card rounded-3xl p-8 shadow-2xl text-center border-2 border-purple-200 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Quiz Completed!</h2>
          <p className="text-slate-500 text-sm mt-1">Topic: {quizData.topic}</p>

          <div className="my-6 py-4 bg-purple-50 rounded-2xl">
            <div className="text-4xl font-black text-purple-700">
              {calculateScore()} / {quizData.questions.length}
            </div>
            <div className="text-xs font-bold text-purple-500 uppercase mt-1">Correct Answers</div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setQuizData(null);
                setTopic('');
              }}
              className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Practice Another Topic
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
