import React from 'react';
import AdminSidebar from '../admin/components/AdminSidebar';
import AdminTopNav from '../admin/components/AdminTopNav';

const AdminManagementLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased text-slate-800">
      {/* Sidebar remains fixed for desktop */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <AdminTopNav />
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 mt-16 scroll-smooth">
          <div className="max-w-[1600px] mx-auto relative h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminManagementLayout;