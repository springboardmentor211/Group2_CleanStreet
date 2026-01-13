import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['citizen', 'volunteer', 'admin']}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['citizen', 'volunteer', 'admin']}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Admin-only route example */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Panel (to be built)</div>
            </ProtectedRoute>
          } />
          
          {/* Volunteer-only route example */}
          <Route path="/volunteer" element={
            <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
              <div>Volunteer Panel (to be built)</div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;