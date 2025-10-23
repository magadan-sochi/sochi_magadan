import React from 'react';
// FIX: Switched to a named import for react-router-dom to resolve module resolution errors.
// FIX-GEMINI: Removing Outlet and react-router-dom import for v5 compatibility.
import BottomNav from '../../components/BottomNav.tsx';

// FIX-GEMINI: Accepting children to render nested routes for v5 compatibility.
const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-background">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
