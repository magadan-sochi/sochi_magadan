
import React from 'react';
// FIX: Switched to namespace import for react-router-dom to resolve module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const AppLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <main className="pb-20">
        <ReactRouterDOM.Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
