import React from 'react';
// FIX: Switched to named imports for react-router-dom to resolve module resolution errors.
// FIX-GEMINI: Downgrading react-router-dom syntax to v5 to fix module export errors.
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

// Page Imports
import LoginPage from './pages/Login.tsx';
import AppLayout from './pages/app/AppLayout.tsx';
import Dashboard from './pages/app/Dashboard.tsx';
import Learn from './pages/app/Learn.tsx';
import LearnSession from './pages/app/LearnSession.tsx';
import Tests from './pages/app/Tests.tsx';
import Quiz from './pages/app/Quiz.tsx';
import Games from './pages/app/Games.tsx';
import Profile from './pages/app/Profile.tsx';
import RepetitionTest from './pages/app/RepetitionTest.tsx';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Switch>
          <Route path="/login" component={LoginPage} />
          {/* LearnSession is now a standalone route for a true full-screen experience */}
          <Route path="/app/learn/session">
            <ProtectedRoute>
              <LearnSession />
            </ProtectedRoute>
          </Route>
          {/* Catch-all for app routes to apply layout and protection */}
          <Route path="/app">
            <ProtectedRoute>
              <AppLayout>
                <Switch>
                  <Route path="/app/dashboard" component={Dashboard} />
                  <Route path="/app/learn" component={Learn} />
                  <Route path="/app/tests/repetition" component={RepetitionTest} />
                  <Route path="/app/tests/:quizId" component={Quiz} />
                  <Route path="/app/tests" component={Tests} />
                  <Route path="/app/games" component={Games} />
                  <Route path="/app/profile" component={Profile} />
                  {/* Redirect from /app to /app/dashboard */}
                  <Route exact path="/app">
                     <Redirect to="/app/dashboard" />
                  </Route>
                </Switch>
              </AppLayout>
            </ProtectedRoute>
          </Route>
          <Route path="/">
            <Redirect to="/app/dashboard" />
          </Route>
        </Switch>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
