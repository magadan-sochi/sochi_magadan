
import React from 'react';
// FIX: Switched to namespace import for react-router-dom to resolve module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
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
  return (
    <AuthProvider>
      <ReactRouterDOM.HashRouter>
        <ReactRouterDOM.Routes>
          <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
          <ReactRouterDOM.Route path="/app" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            {/* Nested routes render inside AppLayout's <Outlet> */}
            <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="dashboard" replace />} />
            <ReactRouterDOM.Route path="dashboard" element={<Dashboard />} />
            <ReactRouterDOM.Route path="learn" element={<Learn />} />
            <ReactRouterDOM.Route path="tests" element={<Tests />} />
            <ReactRouterDOM.Route path="tests/:quizId" element={<Quiz />} />
            <ReactRouterDOM.Route path="tests/repetition" element={<RepetitionTest />} />
            <ReactRouterDOM.Route path="games" element={<Games />} />
            <ReactRouterDOM.Route path="profile" element={<Profile />} />
          </ReactRouterDOM.Route>
          {/* LearnSession is now a standalone route for a true full-screen experience */}
          <ReactRouterDOM.Route path="/app/learn/session" element={
            <ProtectedRoute>
              <LearnSession />
            </ProtectedRoute>
          } />
          <ReactRouterDOM.Route path="/" element={<ReactRouterDOM.Navigate to="/app/dashboard" replace />} />
        </ReactRouterDOM.Routes>
      </ReactRouterDOM.HashRouter>
    </AuthProvider>
  );
}

export default App;
