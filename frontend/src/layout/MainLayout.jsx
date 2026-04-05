import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 flex-col lg:flex-row w-full max-w-none text-left" style={{ textAlign: "left" }}>
      
      {/* 1. Left Sidebar Boundary (Fixed Desktop / Expanding Mobile) */}
      <Sidebar isMobileOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />

      {/* 2. Main Execution Environment Wrapper */}
      <div className="flex flex-col flex-1 w-full lg:w-[calc(100%-16rem)] overflow-hidden bg-gray-50">
        
        <TopNavbar onMenuClick={toggleMobileMenu} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
          {/* React Router safely resolves injected protected view payloads rendering identically right here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
