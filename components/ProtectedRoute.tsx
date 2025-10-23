import React, { ReactNode } from 'react';
// FIX: Switched to named imports for react-router-dom to resolve module resolution errors.
// FIX-GEMINI: Downgrading react-router-dom imports to v5 to fix module export errors.
import { useLocation, Redirect } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // FIX-GEMINI: Using <Redirect> component for v5 compatibility, passing state in the `to` object.
    return <Redirect to={{ pathname: "/login", state: { from: location } }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
