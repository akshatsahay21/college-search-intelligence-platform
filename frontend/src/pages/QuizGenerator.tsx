import { useState } from 'react';
import axios from 'axios';
import { BrainCircuit, Loader2 } from 'lucide-react';

export default function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<any[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuiz(null);
    setSubmitted(false);
    setUserAnswers({});
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/quiz/generate', { topic }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuiz(res.data);
    } catch (error) {
      alert('Failed to generate quiz. Make sure you are logged in!');
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.reduce((score, q, idx) => {
      return score + (userAnswers[idx] === q.answer ? 1 : 0);
    }, 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-8">
      <div className="text-center mb-10">
        <BrainCircuit className="w-16 h-16 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-primary">AI Quiz Generator</h1>
        <p className="text-secondary mt-2">Generate a quick practice test on any topic from your syllabus.</p>
      </div>

      <form onSubmit={handleGenerate} className="flex gap-4 mb-12">
        <input 
          type="text" 
          value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g., Database Normalization, Software Testing..."
          className="flex-1 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary"
          required
        />
        <button type="submit" disabled={loading} className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-900 flex items-center gap-2 transition-all">
          {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Generate Quiz'}
        </button>
      </form>

      {quiz && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-primary mb-6">Pop Quiz: {topic}</h2>
          
          <div className="space-y-8">
            {quiz.map((q, idx) => (
              <div key={idx} className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-lg mb-4">{idx + 1}. {q.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt: string) => (
                    <button 
                      key={opt}
                      onClick={() => !submitted && setUserAnswers({...userAnswers, [idx]: opt})}
                      disabled={submitted}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        userAnswers[idx] === opt 
                          ? 'border-primary bg-blue-50 text-primary font-semibold' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      } ${
                        submitted && opt === q.answer ? 'border-green-500 bg-green-50 text-green-700' : ''
                      } ${
                        submitted && userAnswers[idx] === opt && opt !== q.answer ? 'border-red-500 bg-red-50 text-red-700' : ''
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!submitted ? (
            <button 
              onClick={() => setSubmitted(true)}
              className="mt-8 w-full bg-accent text-primary py-4 rounded-xl font-bold text-lg hover:bg-yellow-500 transition-colors"
            >
              Submit Answers
            </button>
          ) : (
            <div className="mt-8 p-6 bg-green-50 text-green-800 rounded-xl border border-green-200 text-center">
              <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
              <p className="text-lg">You scored {calculateScore()} out of {quiz.length}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
