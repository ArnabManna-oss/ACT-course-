/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import CoursePlayer from './components/CoursePlayer';
import { Toaster } from 'sonner';

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
      <Route 
        path="/dashboard" 
        element={
          user ? (
            profile?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />
          ) : (
            <Navigate to="/" />
          )
        } 
      />
      <Route 
        path="/course/:courseId" 
        element={
          user ? <CoursePlayer /> : <Navigate to="/dashboard" />
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-center" />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

