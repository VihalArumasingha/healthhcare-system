import React from 'react';
import UserNavigation from '../components/UserNavigation';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <UserNavigation />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;