import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Video, ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react';
import { subscribeToAuthChanges } from '../auth/services/authService';
// IMPORTANT: Updated extension from .png to .jpg based on actual file existence
import heroImage from '../assets/Home Clinic.jpg'; 

const Home = () => {
  const [telemedicinePath, setTelemedicinePath] = useState('/doctors');
  const [telemedicineLabel, setTelemedicineLabel] = useState('Telemedicine');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((authState) => {
      const role = authState?.role || null;
      setUserRole(role);
      setLoading(false);

      if (role === 'doctor') {
        setTelemedicinePath('/doctor-dashboard/telemedicine');
        setTelemedicineLabel('Telemedicine Control Room');
      } else {
        setTelemedicinePath('/doctors');
        setTelemedicineLabel('Find Telemedicine Doctor');
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  // Redirect Admin away from the public Home page
  if (userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="flex-grow bg-white">
      {/* Hero Section */}
      <div className="relative bg-teal-50 overflow-hidden min-h-[600px] flex items-center">
        <div className="max-w-7xl mx-auto w-full relative">
          <div className="relative z-10 pb-8 bg-teal-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-10 sm:pt-16 lg:pt-20 px-4 sm:px-6 lg:px-8">
            <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Modern healthcare for </span>
                  <span className="block text-teal-600 xl:inline">you and your family</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Experience wellness that feels like home. Book appointments easily, consult top-rated doctors, and manage your health journey in one beautiful space.
                </p>
                <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3">
                  <div className="rounded-md shadow">
                    <Link to="/doctors" className="w-full flex items-center justify-center gap-2 px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors md:py-4 md:text-lg md:px-10">
                      <Stethoscope className="w-4 h-4" /> Find a Doctor
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to={telemedicinePath} className="w-full flex items-center justify-center gap-2 px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 transition-colors md:py-4 md:text-lg md:px-10">
                      <Video className="w-4 h-4" /> {telemedicineLabel}
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to="/register" className="w-full flex items-center justify-center gap-2 px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 transition-colors md:py-4 md:text-lg md:px-10">
                      Join HealthEase
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 p-8">
          <div className="h-full w-full relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              className="h-full w-full object-cover"
              src={heroImage}
              alt="Modern Home Clinic"
              onError={(e) => { 
                // Fallback inside dev if image extension is wrong
                e.target.src = 'https://placehold.co/800x600/0d9488/ffffff?text=Add+Home+Clinic+Image+Here';
              }}
            />
            {/* Subtle Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-slate-950 text-white p-8 shadow-2xl shadow-slate-200/40 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.2),_transparent_30%)]" />
            <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Fast access
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight">Book care faster with direct access to doctors.</h2>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Find the right doctor, schedule a consultation, and move into telemedicine when needed.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={telemedicinePath} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-black text-white hover:bg-white/15 transition-colors">
                  <Video className="w-4 h-4" /> {telemedicineLabel}
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm border border-teal-100">
            <h3 className="text-lg font-black text-slate-900">What’s live now</h3>
            <div className="mt-5 space-y-4">
              <FeatureRow title={telemedicineLabel} text="Create sessions, generate join tokens, and start calls." to={telemedicinePath} />
              <FeatureRow title="Doctor Booking Flow" text="Book an appointment and move to video consults." to="/doctors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function FeatureRow({ title, text, to }) {
  return (
    <Link to={to} className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-colors">
      <div>
        <p className="font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500 leading-6">{text}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
    </Link>
  );
}

export default Home;