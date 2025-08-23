import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import CommitteeRoom from './pages/CommitteeRoom';
import CommitteeQueue from './pages/CommitteeQueue';
import AdminDashboard from './pages/AdminDashboard';
import RoomManagement from './pages/RoomManagement';
import HomeSettings from './pages/HomeSettings';
import ResendVerification from "./pages/resend-verification";
import VerifyEmailPage from "./pages/verify-email";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/resend-verification"
                element={<ResendVerification />}
              />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/committee/room"
                element={
                  <ProtectedRoute allowedRoles={["committee"]}>
                    <CommitteeRoom />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <HomeSettings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/rooms"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <RoomManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/committee/queue"
                element={
                  <ProtectedRoute allowedRoles={["committee"]}>
                    <CommitteeQueue />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;