
import React from 'react';
// FIX: Switched to named imports for react-router-dom to resolve component access errors.
import { Outlet } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const AppLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;