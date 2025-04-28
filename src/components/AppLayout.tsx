
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const hideNavigation = ['/login', '/signup'].includes(location.pathname);
  
  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <main className="flex-1 pb-20 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>
      
      {!hideNavigation && <BottomNavigation />}
    </div>
  );
};

export default AppLayout;
