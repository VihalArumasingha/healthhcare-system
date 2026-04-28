import React from 'react';
import PatientSidebar from '../patient/components/PatientSidebar';
import PatientTopNav from '../patient/components/PatientTopNav';

const PatientManagementLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <PatientSidebar />

      {/* Main Content Area (shifted right by the width of the sidebar) */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 min-h-screen">
        {/* Fixed Top Navigation */}
        <PatientTopNav />
        
        {/* Dynamic Content Space */}
        <main className="flex-1 p-6 md:p-8 mt-16 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PatientManagementLayout;