import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  LinearProgress,
  Alert,
  useTheme,
  alpha,
  useMediaQuery,
  Container
} from '@mui/material'
import {
  TrendingUp,
  People,
  Assessment,
  Settings,
  ArrowRight,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Shield,
  Groups,
  VolunteerActivism,
  HourglassEmpty
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Breadcrumbs,
  Link
} from '@mui/material'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const AdminHome = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    superAdmins: 0
  })
  const [pendingVolunteersCount, setPendingVolunteersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isAdminSubdomain = typeof window !== 'undefined' && 
    window.location.hostname.startsWith('admin.')

  useEffect(() => {
    fetchStats()
    fetchPendingVolunteersCount()
  }, [])

  const fetchPendingVolunteersCount = async () => {
    try {
      const res = await apiClient.get('/admin/volunteers/pending')
      setPendingVolunteersCount(res.data.count || 0)
    } catch (err) {
      console.log('Could not fetch pending volunteers count')
    }
  }

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/admin/dashboard/stats')
      const apiStats = res.data.stats || {}
      setStats({
        totalUsers: apiStats.totalUsers ?? 0,
        activeUsers: apiStats.activeUsers ?? 0,
        admins: apiStats.admins ?? apiStats.totalAdmins ?? 0,
        superAdmins: apiStats.superAdmins ?? apiStats.totalSuperAdmins ?? 0
      })
    } catch (err) {
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, growth }) => (
    <Card sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
      border: `1px solid ${alpha(color, 0.2)}`,
      borderRadius: 2,
      position: 'relative',
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`
      }
    }}>
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <Stack direction={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'flex-start' : 'center'} justifyContent="space-between" spacing={isMobile ? 1 : 2}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight="medium" sx={{ textTransform: 'uppercase', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
              {title}
            </Typography>
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" sx={{ mt: 0.5 }}>
              {value}
            </Typography>
            {growth && (
              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.3, fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                ↑ {growth}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: isMobile ? 40 : 56,
            height: isMobile ? 40 : 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.1)} 100%)`,
            border: `1px solid ${alpha(color, 0.3)}`,
            flexShrink: 0
          }}>
            <Icon sx={{ fontSize: isMobile ? 20 : 28, color: color }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color, badge }) => (
    <Paper
      onClick={onClick}
      sx={{
        p: isMobile ? 1.5 : 2.5,
        borderRadius: 2,
        cursor: 'pointer',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        position: 'relative',
        '&:hover': {
          transform: isMobile ? 'none' : 'translateY(-4px)',
          boxShadow: isMobile ? theme.shadows[4] : theme.shadows[8],
          borderColor: color
        }
      }}
    >
      {badge !== undefined && badge > 0 && (
        <Box sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
          color: 'white',
          borderRadius: '50%',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          boxShadow: `0 2px 8px ${alpha('#ff5252', 0.3)}`
        }}>
          {badge}
        </Box>
      )}
      <Stack spacing={1}>
        <Box sx={{
          width: isMobile ? 36 : 48,
          height: isMobile ? 36 : 48,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.1)} 100%)`
        }}>
          <Icon sx={{ fontSize: isMobile ? 18 : 24, color: color }} />
        </Box>
        <Box>
          <Typography variant="body2" fontWeight="600" sx={{ fontSize: isMobile ? '0.875rem' : '0.95rem' }}>{title}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem', lineHeight: 1.3 }}>{description}</Typography>
        </Box>
        <ArrowRight sx={{ fontSize: isMobile ? 14 : 18, color: color, opacity: 0.5 }} />
      </Stack>
    </Paper>
  )

  const adminPath = (page) => isAdminSubdomain ? `/${page}` : `/admin/${page}`

  return (
    <Box>
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            component="button"
            underline="hover"
            color="text.secondary"
            onClick={(e) => {
              e.preventDefault()
              const path = isAdminSubdomain ? '/home' : '/admin/home'
              navigate(path)
            }}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Home
          </Link>
          <Link
            component="button"
            underline="hover"
            color="text.secondary"
            onClick={(e) => {
              e.preventDefault()
              const path = isAdminSubdomain ? '/dashboard' : '/admin/dashboard'
              navigate(path)
            }}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <DashboardIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <Shield sx={{ mr: 0.5, fontSize: 20 }} />
            Admin Console
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Welcome Section */}
      <Paper sx={{
        p: isMobile ? 2 : 3,
        mb: isMobile ? 3 : 4,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white'
      }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" gutterBottom>
          Welcome to Admin Panel
        </Typography>
        <Typography variant={isMobile ? 'body2' : 'body1'} sx={{ opacity: 0.9 }}>
          Monitor your platform, manage users, and track system performance all in one place.
        </Typography>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats Overview */}
      <Box sx={{ mb: isMobile ? 4 : 5 }}>
        <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight="bold" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', fontSize: isMobile ? '0.95rem' : '1.25rem' }}>
          <Assessment sx={{ mr: 1, fontSize: isMobile ? 20 : 24 }} />
          Statistics Overview
        </Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={People}
              color={theme.palette.primary.main}
              growth={`${stats.activeUsers} active`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              icon={TrendingUp}
              color={theme.palette.success.main}
              growth={`${((stats.activeUsers / stats.totalUsers) * 100 || 0).toFixed(1)}%`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Admin Users"
              value={stats.admins}
              icon={Settings}
              color={theme.palette.warning.main}
              growth={`${stats.superAdmins} Super`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="System Health"
              value="Good"
              icon={Assessment}
              color={theme.palette.info.main}
              growth="100% uptime"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: isMobile ? 4 : 5 }}>
        <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight="bold" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', fontSize: isMobile ? '0.95rem' : '1.25rem' }}>
          <ArrowRight sx={{ mr: 1, fontSize: isMobile ? 20 : 24 }} />
          Quick Actions
        </Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Manage Users"
              description="View and manage all users"
              icon={People}
              color={theme.palette.primary.main}
              onClick={() => navigate(adminPath('users'))}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Community"
              description="View community issues"
              icon={Groups}
              color={theme.palette.warning.main}
              onClick={() => navigate(adminPath('community'))}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="View Reports"
              description="Check system reports"
              icon={Assessment}
              color={theme.palette.info.main}
              onClick={() => navigate(adminPath('reports'))}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="System Settings"
              description="Configure system"
              icon={Settings}
              color={theme.palette.warning.main}
              onClick={() => navigate(adminPath('settings'))}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Dashboard"
              description="Full statistics view"
              icon={TrendingUp}
              color={theme.palette.success.main}
              onClick={() => navigate(adminPath('dashboard'))}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Pending Volunteers"
              description="Verify & approve volunteers"
              icon={VolunteerActivism}
              color={theme.palette.warning.main}
              badge={pendingVolunteersCount}
              onClick={() => navigate(adminPath('pending-volunteers'))}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Info Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight="bold" gutterBottom sx={{ mb: 2, fontSize: isMobile ? '0.95rem' : '1.25rem' }}>
          Information & Status
        </Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: isMobile ? 2 : 3, 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <Typography variant={isMobile ? 'body2' : 'h6'} fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                📊 Getting Started
              </Typography>
              <Stack spacing={1}>
                <Typography variant="caption" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', lineHeight: 1.5 }}>
                  • Check the Users section to manage platform users
                </Typography>
                <Typography variant="caption" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', lineHeight: 1.5 }}>
                  • Monitor Reports for system activity
                </Typography>
                <Typography variant="caption" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', lineHeight: 1.5 }}>
                  • Adjust Settings for system configuration
                </Typography>
                <Typography variant="caption" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', lineHeight: 1.5 }}>
                  • Visit Dashboard for detailed analytics
                </Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: isMobile ? 2 : 3, 
              borderRadius: 2, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.info.main, 0.04)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
            }}>
              <Typography variant={isMobile ? 'body2' : 'h6'} fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                ✅ System Status
              </Typography>
              <Stack spacing={isMobile ? 1.5 : 2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ fontWeight: 500, fontSize: isMobile ? '0.75rem' : '0.875rem', display: 'block' }}>
                    API Server
                  </Typography>
                  <LinearProgress variant="determinate" value={100} sx={{ height: isMobile ? 4 : 6, borderRadius: 3 }} />
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.3, display: 'block', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                    Operational
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ fontWeight: 500, fontSize: isMobile ? '0.75rem' : '0.875rem', display: 'block' }}>
                    Database
                  </Typography>
                  <LinearProgress variant="determinate" value={100} sx={{ height: isMobile ? 4 : 6, borderRadius: 3 }} />
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.3, display: 'block', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                    Healthy
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ fontWeight: 500, fontSize: isMobile ? '0.75rem' : '0.875rem', display: 'block' }}>
                    Cache
                  </Typography>
                  <LinearProgress variant="determinate" value={95} sx={{ height: isMobile ? 4 : 6, borderRadius: 3 }} />
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.3, display: 'block', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                    95% Performance
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default AdminHome
