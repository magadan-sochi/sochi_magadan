import React from 'react';
// FIX: Use direct named imports for react-router-dom components.
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

// Page Imports
import LoginPage from './pages/Login';
import AppLayout from './pages/app/AppLayout';
import Dashboard from './pages/app/Dashboard';
import Learn from './pages/app/Learn';
import LearnSession from './pages/app/LearnSession';
import Tests from './pages/app/Tests';
import Quiz from './pages/app/Quiz';
import Games from './pages/app/Games';
import Profile from './pages/app/Profile';
import RepetitionTest from './pages/app/RepetitionTest';

function App() {
  console.log("App component is rendering.");
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            {/* Nested routes render inside AppLayout's <Outlet> */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="learn" element={<Learn />} />
            <Route path="tests" element={<Tests />} />
            <Route path="tests/:quizId" element={<Quiz />} />
            <Route path="tests/repetition" element={<RepetitionTest />} />
            <Route path="games" element={<Games />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          {/* LearnSession is now a standalone route for a true full-screen experience */}
          <Route path="/app/learn/session" element={
            <ProtectedRoute>
              <LearnSession />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;