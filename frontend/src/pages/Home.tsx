import { Link } from 'react-router-dom';
import { Search, Brain, BookOpen, GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[85vh] bg-slate-50 flex flex-col items-center justify-center">
      <div className="text-center max-w-4xl mx-auto p-4">
        <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-6">
          <GraduationCap className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-6xl font-extrabold text-primary mb-6 tracking-tight">
          The Intelligent College <br/><span className="text-accent">Knowledge Platform</span>
        </h1>
        <p className="text-xl text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
          Instantly search through thousands of syllabi, notes, and previous year questions. Powered by Llama 3 AI.
        </p>
        <div className="flex justify-center gap-6">
          <Link to="/register" className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
            Get Started <BookOpen className="w-5 h-5"/>
          </Link>
          <Link to="/login" className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all shadow-sm">
            Sign In
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-24 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <Search className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary mb-2">Semantic Search</h3>
          <p className="text-secondary">Find exactly what you need even if you don't use the exact keywords.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <Brain className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary mb-2">AI Overviews</h3>
          <p className="text-secondary">Get instant, generated answers to your questions directly from your college documents.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <BookOpen className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary mb-2">Smart Quizzes</h3>
          <p className="text-secondary">Generate MCQ tests automatically from any syllabus to prepare for your exams.</p>
        </div>
      </div>
    </div>
  );
}
