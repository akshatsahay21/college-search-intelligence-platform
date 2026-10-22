import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import AdminUpload from './pages/AdminUpload';
import StudentSearch from './pages/StudentSearch';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuizGenerator from './pages/QuizGenerator';
import Home from './pages/Home';

function Navbar() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <span className="text-accent">◆</span> College Intelligence
        </Link>
        <div className="space-x-6 font-medium flex items-center">
          {token ? (
            <>
              {user.role === 'ADMIN' ? (
                <>
                  <Link to="/admin" className="hover:text-accent transition-colors">Admin Dashboard</Link>
                  <Link to="/admin/upload" className="hover:text-accent transition-colors">Upload</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
                  <Link to="/search" className="hover:text-accent transition-colors">AI Search</Link>
                  <Link to="/quiz" className="hover:text-accent transition-colors">Quiz</Link>
                </>
              )}
              <button onClick={handleLogout} className="text-red-300 hover:text-red-400 font-bold ml-4 border border-red-400 px-3 py-1 rounded transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-accent transition-colors">Login</Link>
              <Link to="/register" className="bg-accent text-primary px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/search" element={<StudentSearch />} />
            <Route path="/quiz" element={<QuizGenerator />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/upload" element={<AdminUpload />} />
            <Route path="/" element={<Home />} /> 
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
