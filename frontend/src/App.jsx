import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { subscribeToAuthChanges } from "./auth/services/authService";
import Register from "./auth/pages/Register";
import Login from "./auth/pages/Login";
import WaitingPage from "./auth/pages/WaitingPage";
import MainLayout from "./layouts/MainLayout";
import PatientManagementLayout from "./layouts/PatientManagementLayout";
import Home from "./pages/Home";
import PaymentPage from "./payment/PaymentPage";
import PaymentSuccess from "./payment/PaymentSuccess";
import PatientProfile from "./patient/pages/PatientProfile";
import PatientDashboard from "./patient/pages/PatientDashboard";
import MedicalRecords from "./patient/pages/MedicalRecords";
import Prescriptions from "./patient/pages/Prescriptions";
import MyAppointments from "./patient/pages/MyAppointments";
import DoctorDashboard from "./doctor/pages/DoctorDashboard";
import ProfilePage from "./doctor/pages/ProfilePage";
import AvailabilityPage from "./doctor/pages/AvailabilityPage";
import DoctorAppointments from "./doctor/pages/DoctorAppointments";
import TelemedicinePage from "./doctor/pages/TelemedicinePage";
import DoctorList from "./doctor/pages/DoctorList";
import DoctorDetails from "./doctor/pages/DoctorDetails";
import BookingPage from "./doctor/pages/BookingPage";
import TelemedicineRoom from "./telemedicine/pages/TelemedicineRoom";

import AdminManagementLayout from "./layouts/AdminManagementLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import VerifyDoctors from "./admin/pages/VerifyDoctors";
import AdminDoctors from "./admin/pages/AdminDoctors";
import AdminPatients from "./admin/pages/AdminPatients";
import AdminSettings from "./admin/pages/AdminSettings";

const PrivateRoute = ({ children, allowedRole }) => {
  const [userState, setUserState] = useState({ loading: true, user: null, role: null, verified: false });

  useEffect(() => {
    const unsub = subscribeToAuthChanges((data) => {
      setUserState({
        loading: false,
        user: data?.user || null,
        role: data?.role || null,
        verified: data?.role === 'doctor' ? data?.claims?.isVerified : true // All non-doctors are (effectively) verified
      });
    });

    return () => unsub();
  }, []);

  if (userState.loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!userState.user) return <Navigate to="/login" />;
  if (userState.loading) {
    return <div className="flex min-h-screen items-center justify-center font-bold text-slate-800 tracking-tight">HealthEase is loading...</div>;
  }

  if (!userState.user) {
    return <Navigate to="/login" />;
  }

  // Handle unverified doctors
  if (userState.role === 'doctor' && !userState.verified) {
    // Only allow visit waiting page or profile if we wanted, but let's force waiting page for now
    return <Navigate to="/waiting" />;
  }

  if (allowedRole && userState.role && userState.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/waiting" element={<WaitingPage />} />
        <Route path="/doctors" element={<MainLayout><DoctorList /></MainLayout>} />
        <Route path="/book/:id" element={<MainLayout><BookingPage /></MainLayout>} />
        <Route path="/payment" element={<MainLayout><PaymentPage /></MainLayout>} />
        <Route path="/payment-success" element={<MainLayout><PaymentSuccess /></MainLayout>} />

        <Route
          path="/patient/dashboard"
          element={
            <PrivateRoute allowedRole="patient">
              <PatientManagementLayout>
                <PatientDashboard />
              </PatientManagementLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/patient/profile"
          element={
            <PrivateRoute allowedRole="patient">
              <PatientManagementLayout>
                <PatientProfile />
              </PatientManagementLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/patient/records"
          element={
            <PrivateRoute allowedRole="patient">
              <PatientManagementLayout>
                <MedicalRecords />
              </PatientManagementLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/patient/prescriptions"
          element={
            <PrivateRoute allowedRole="patient">
              <PatientManagementLayout>
                <Prescriptions />
              </PatientManagementLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/patient/appointments"
          element={
            <PrivateRoute allowedRole="patient">
              <Navigate to="/my-appointments" replace />
            </PrivateRoute>
          }
        />

        <Route
          path="/my-appointments"
          element={
            <PrivateRoute allowedRole="patient">
              <MainLayout>
                <MyAppointments />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRole="admin">
              <AdminManagementLayout>
                <AdminDashboard />
              </AdminManagementLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/verify-doctors"
          element={
            <PrivateRoute allowedRole="admin">
              <AdminManagementLayout>
                <VerifyDoctors />
              </AdminManagementLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/doctors"
          element={
            <PrivateRoute allowedRole="admin">
              <AdminManagementLayout>
                <AdminDoctors />
              </AdminManagementLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/patients"
          element={
            <PrivateRoute allowedRole="admin">
              <AdminManagementLayout>
                <AdminPatients />
              </AdminManagementLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <PrivateRoute allowedRole="admin">
              <AdminManagementLayout>
                <AdminSettings />
              </AdminManagementLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/doctor-dashboard/*"
          element={
            <PrivateRoute allowedRole="doctor">
              <DoctorDashboard />
            </PrivateRoute>
          }
        >
          <Route path="profile" element={<ProfilePage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="telemedicine" element={<TelemedicinePage />} />
        </Route>

        <Route
          path="/telemedicine/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <TelemedicineRoom />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route path="/doctor/:id" element={<MainLayout><DoctorDetails /></MainLayout>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
