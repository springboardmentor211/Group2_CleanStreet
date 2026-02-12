import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import { CssBaseline } from '@mui/material'
import { useMemo, useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { getSubdomain } from './utils/subdomain'

// Layout
import MainLayout from './components/Layout/MainLayout'
import PublicLayout from './components/Layout/PublicLayout'
import AdminLayout from './components/Layout/AdminLayout'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import Profile from './pages/Profile'
import Dashboard from './pages/user/Dashboard'
import Reports from './pages/user/Reports'
import Map from './pages/user/Map'
import History from './pages/user/History'
import AdminHome from './pages/admin/Home'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminVolunteers from './pages/admin/Volunteers'
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'
import AdminPendingVolunteers from './pages/admin/PendingVolunteers'
import AdminLogin from './pages/admin/Login'
import SetupWizard from './components/setup/SetupWizard'
import ReportIssue from './pages/ReportIssue'
import About from './pages/About'
import Contact from './pages/Contact'
import Settings from './pages/user/Settings'
import Activity from './pages/user/Activity'
import Analytics from './pages/user/Analytics'
import Community from './pages/user/Community'
import VolunteerLogin from './pages/volunteer/Login'
import VolunteerDashboard from './pages/volunteer/Dashboard'
import VolunteerHome from './pages/volunteer/Home'
import VolunteerProfile from './pages/volunteer/Profile'
import VolunteerReports from './pages/volunteer/Reports'
import VolunteerLanding from './pages/volunteer/Landing'
import VolunteerRegister from './pages/volunteer/Register'
import VolunteerForgotPassword from './pages/volunteer/ForgotPassword'
import VolunteerVerifyEmail from './pages/volunteer/VerifyEmail'
import VolunteerVerificationPending from './pages/volunteer/VerificationPending'
import VolunteerEvents from './pages/volunteer/Events'
import MyEvents from './pages/volunteer/MyEvents'
import CreateEvent from './pages/volunteer/CreateEvent'

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute'

function App() {
  const [mode, setMode] = useState('light')
  const [subdomain, setSubdomain] = useState(() => {
    // Initialize subdomain immediately from window.location
    return getSubdomain()
  })

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#0f1115',
        paper: mode === 'light' ? '#ffffff' : '#141821',
      },
    },
  }), [mode])

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Volunteer Subdomain Routes (volunteer.cleanstreet.com) */}
            {subdomain === 'volunteer' ? (
              <>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<PublicLayout><VolunteerLogin /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><VolunteerRegister /></PublicLayout>} />
                <Route path="/forgot-password" element={<PublicLayout><VolunteerForgotPassword /></PublicLayout>} />
                <Route path="/verify-email" element={<PublicLayout><VolunteerVerifyEmail /></PublicLayout>} />
                <Route path="/verification-pending" element={
                  <ProtectedRoute allowedRoles={["volunteer"]}>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <VolunteerVerificationPending />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/home" element={
                  <ProtectedRoute allowedRoles={["volunteer", "admin", "super-admin"]} requireVolunteerVerified={true}>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <VolunteerHome />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={["volunteer", "admin", "super-admin"]} requireVolunteerVerified={true}>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <VolunteerDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/community" element={
                  <ProtectedRoute allowedRoles={["volunteer", "admin", "super-admin"]} requireVolunteerVerified={true}>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <Community />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute allowedRoles={["volunteer", "admin", "super-admin"]} requireVolunteerVerified={true}>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <VolunteerProfile />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/events" element={
                  <ProtectedRoute allowedRoles={["volunteer", "admin", "super-admin"]} requireVolunteerVerified={true}>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <VolunteerEvents />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/my-events" element={
                  <ProtectedRoute allowedRoles={["volunteer", "admin", "super-admin"]} requireVolunteerVerified={true}>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <MyEvents />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/create-event" element={
                  <ProtectedRoute allowedRoles={["volunteer", "admin", "super-admin"]} requireVolunteerVerified={true}>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <CreateEvent />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute allowedRoles={["volunteer", "admin", "super-admin"]} requireVolunteerVerified={true}>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <VolunteerReports />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : subdomain === 'admin' ? (
              <>
                {/* Admin Subdomain Routes (admin.cleanstreet.com) */}
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/setup" element={<SetupWizard />} />
                <Route path="/login" element={<PublicLayout><AdminLogin /></PublicLayout>} />
                <Route path="/home" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminHome />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminUsers />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminReports />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminSettings />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/pending-volunteers" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminPendingVolunteers />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/volunteers" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminVolunteers />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/community" element={<PublicLayout><Community /></PublicLayout>} />
                <Route path="*" element={<Navigate to="/home" />} />
              </>
            ) : (
              <>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/setup" element={<SetupWizard />} />
                <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
                <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
                <Route path="/verify-email" element={<PublicLayout><VerifyEmail /></PublicLayout>} />
                {/* Report Issue moved under protected route as /report-issue */}
                <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                <Route path="/community" element={<PublicLayout><Community /></PublicLayout>} />
                
                {/* Protected User Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <PublicLayout>
                      <Profile />
                    </PublicLayout>
                  </ProtectedRoute>
                } />
                <Route path="/report-issue" element={
                  <ProtectedRoute>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <ReportIssue />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                {/* Redirect legacy Issues page to Community */}
                <Route path="/issues" element={<Navigate to="/community" replace />} />
                <Route path="/my-reports" element={
                  <ProtectedRoute>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <Reports />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/home" element={
                  <ProtectedRoute allowedRoles={["volunteer"]}>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <VolunteerHome />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <Reports />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/map" element={
                  <ProtectedRoute>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <Map />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <History />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <Settings />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/activity" element={
                  <ProtectedRoute>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <Activity />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <Analytics />
                    </MainLayout>
                  </ProtectedRoute>
                } />
                
                {/* Admin Path Routes (fallback) */}
                <Route path="/admin/login" element={<PublicLayout><AdminLogin /></PublicLayout>} />
                <Route path="/admin/home" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminHome />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/community" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <Community />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminUsers />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/volunteers" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminVolunteers />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminReports />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/pending-volunteers" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminPendingVolunteers />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminSettings />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
              </>
            )}
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App