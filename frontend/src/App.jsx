import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import { CssBaseline, Box, Typography, Button } from '@mui/material'
import { useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Home as HomeIcon } from '@mui/icons-material'

// Layout
import MainLayout from './components/Layout/MainLayout'
import PublicLayout from './components/Layout/PublicLayout'
import AdminLayout from './components/Layout/AdminLayout'
import VolunteerLayout from './components/Layout/VolunteerLayout'

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
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'
import AdminLogin from './pages/admin/Login'
import SetupWizard from './components/setup/SetupWizard'
import ReportIssue from './pages/ReportIssue'
import About from './pages/About'
import Contact from './pages/Contact'
import Issues from './pages/user/Issues'
import Settings from './pages/user/Settings'
import Activity from './pages/user/Activity'
import Analytics from './pages/user/Analytics'
import VolunteerRegister from './pages/auth/VolunteerRegister'
import VolunteerLogin from './pages/auth/VolunteerLogin'
import VolunteerDashboard from './pages/volunteer/Dashboard'
import VolunteerIssues from './pages/volunteer/Issues'
import VolunteerProfile from './pages/volunteer/Profile'
import VolunteerPerformance from './pages/volunteer/Performance'
import VolunteerTasksActive from './pages/volunteer/TasksActive'
import VolunteerTasksCompleted from './pages/volunteer/TasksCompleted'
import VolunteerHistory from './pages/volunteer/History'
import VolunteerMap from './pages/volunteer/Map'

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute'
import ProtectedVolunteerRoute from './components/Auth/ProtectedVolunteerRoute'

function App() {
  const [mode, setMode] = useState('light')

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { 
        main: mode === 'light' ? '#1976d2' : '#90caf9',
        light: mode === 'light' ? '#42a5f5' : '#bbdefb',
        dark: mode === 'light' ? '#1565c0' : '#42a5f5'
      },
      secondary: { 
        main: mode === 'light' ? '#9c27b0' : '#ce93d8',
        light: mode === 'light' ? '#ba68c8' : '#e1bee7',
        dark: mode === 'light' ? '#7b1fa2' : '#ab47bc'
      },
      success: {
        main: '#4CAF50',
        light: '#81c784',
        dark: '#388e3c'
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f'
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00'
      },
      info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2'
      },
      background: {
        default: mode === 'light' ? '#f8f9fa' : '#0f1115',
        paper: mode === 'light' ? '#ffffff' : '#1e2229',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' 
              ? '0 2px 8px rgba(0,0,0,0.08)' 
              : '0 2px 8px rgba(0,0,0,0.3)',
            borderRadius: 12,
          },
        },
      },
    },
  }), [mode])

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Detect if accessing via admin subdomain
  const isAdminSubdomain = typeof window !== 'undefined' && 
    window.location.hostname.startsWith('admin.')
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Admin Subdomain Routes */}
            {isAdminSubdomain ? (
              <>
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
                <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                
                {/* Volunteer Public Routes */}
                <Route path="/volunteer/login" element={<PublicLayout><VolunteerLogin /></PublicLayout>} />
                <Route path="/volunteer/register" element={<PublicLayout><VolunteerRegister /></PublicLayout>} />
                
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
                <Route path="/issues" element={
                  <ProtectedRoute>
                    <MainLayout toggleColorMode={toggleColorMode}>
                      <Issues />
                    </MainLayout>
                  </ProtectedRoute>
                } />
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
                
                {/* Protected Volunteer Routes */}
                <Route path="/volunteer/dashboard" element={
                  <ProtectedVolunteerRoute>
                    <VolunteerLayout>
                      <VolunteerDashboard />
                    </VolunteerLayout>
                  </ProtectedVolunteerRoute>
                } />
                <Route path="/volunteer/issues" element={
                  <ProtectedVolunteerRoute>
                    <VolunteerLayout>
                      <VolunteerIssues />
                    </VolunteerLayout>
                  </ProtectedVolunteerRoute>
                } />
                <Route path="/volunteer/tasks/active" element={
                  <ProtectedVolunteerRoute>
                    <VolunteerLayout>
                      <VolunteerTasksActive />
                    </VolunteerLayout>
                  </ProtectedVolunteerRoute>
                } />
                <Route path="/volunteer/tasks/completed" element={
                  <ProtectedVolunteerRoute>
                    <VolunteerLayout>
                      <VolunteerTasksCompleted />
                    </VolunteerLayout>
                  </ProtectedVolunteerRoute>
                } />
                <Route path="/volunteer/profile" element={
                  <ProtectedVolunteerRoute>
                    <VolunteerLayout>
                      <VolunteerProfile />
                    </VolunteerLayout>
                  </ProtectedVolunteerRoute>
                } />
                <Route path="/volunteer/performance" element={
                  <ProtectedVolunteerRoute>
                    <VolunteerLayout>
                      <VolunteerPerformance />
                    </VolunteerLayout>
                  </ProtectedVolunteerRoute>
                } />
                <Route path="/volunteer/history" element={
                  <ProtectedVolunteerRoute>
                    <VolunteerLayout>
                      <VolunteerHistory />
                    </VolunteerLayout>
                  </ProtectedVolunteerRoute>
                } />
                <Route path="/volunteer/map" element={
                  <ProtectedVolunteerRoute>
                    <VolunteerLayout>
                      <VolunteerMap />
                    </VolunteerLayout>
                  </ProtectedVolunteerRoute>
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
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminDashboard />
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
                <Route path="/admin/reports" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminReports />
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
                
                {/* Catch-all route */}
                <Route path="*" element={
                  <PublicLayout>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h4" sx={{ mb: 2 }}>
                        404 - Page Not Found
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3 }}>
                        The page you're looking for doesn't exist.
                      </Typography>
                      <Button 
                        variant="contained" 
                        component={Link} 
                        to="/"
                        startIcon={<HomeIcon />}
                      >
                        Go to Homepage
                      </Button>
                    </Box>
                  </PublicLayout>
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