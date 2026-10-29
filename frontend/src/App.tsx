import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentSearch from './pages/StudentSearch';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUpload from './pages/AdminUpload';
import QuizGenerator from './pages/QuizGenerator';
import Login from './pages/Login';
import Register from './pages/Register';
import { getStoredUser } from './services/api';

// Protected Route wrapper
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/search" replace />;
  }
  return <>{children}</>;
}

function MainLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-500 selection:text-white ${
        isLoginPage ? 'h-screen max-h-screen overflow-hidden' : ''
      }`}
    >
      {!isAuthPage && <Navbar />}
      <main
        className={`flex-1 ${
          isAuthPage
            ? 'w-full h-full p-0 m-0 overflow-hidden'
            : 'pb-16'
        }`}
      >
        <Routes>
          {/* Default URL opens Login Page directly */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<StudentSearch />} />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/quiz" element={<QuizGenerator />} />

          {/* Faculty Protected Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/upload"
            element={
              <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <AdminUpload />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/upload"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <AdminUpload />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}
