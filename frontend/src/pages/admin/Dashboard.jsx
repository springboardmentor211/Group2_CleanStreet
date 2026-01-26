import React, { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  CircularProgress,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  InputAdornment,
  LinearProgress,
  alpha,
  useTheme,
  Badge,
  Tabs,
  Tab,
  CardHeader,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  Breadcrumbs,
  Link,
  Stack,
  InputLabel,
  Select,
  FormControl,
  OutlinedInput,
  Checkbox,
  useMediaQuery
} from '@mui/material'
import {
  Add,
  Delete,
  Lock,
  LockOpen,
  AdminPanelSettings,
  Person,
  Refresh,
  Key,
  Search,
  MoreVert,
  CheckCircle,
  Cancel,
  TrendingUp,
  Group,
  Security,
  Download,
  Email,
  Phone,
  CalendarToday,
  Visibility,
  Logout,
  PeopleAlt,
  SupervisedUserCircle,
  HourglassEmpty,
  FilterList,
  Sort,
  ArrowUpward,
  ArrowDownward,
  Home,
  Dashboard as DashboardIcon,
  PersonAdd,
  VerifiedUser,
  Shield,
  AccessTime,
  Edit,
  ContentCopy,
  FileDownload,
  BarChart,
  PieChart,
  Timeline,
  Notifications,
  Settings,
  HelpOutline,
  TaskAlt,
  Warning,
  Info,
  AccountCircle,
  Badge as BadgeIcon,
  WorkspacePremium,
  Category,
  Business,
  LocationOn,
  Language,
  Public,
  CloudUpload
} from '@mui/icons-material'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE_URL = '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

const AdminDashboard = () => {
  const theme = useTheme()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  
  const isAdminSubdomain = typeof window !== 'undefined' && 
    window.location.hostname.startsWith('admin.')
  
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    superAdmins: 0,
    pendingVerifications: 0,
    userGrowth: 12.5,
    todayActive: 0,
    monthlyGrowth: 0
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [activeTab, setActiveTab] = useState(0)
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false)
  const [adminDialogStep, setAdminDialogStep] = useState(0)
  const [openUserDetails, setOpenUserDetails] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [selectedActionUser, setSelectedActionUser] = useState(null)
  
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    name: '',
    password: '',
    role: 'admin',
    permissions: [],
    phone: '',
    department: '',
    avatarColor: '#2196f3'
  })

  const permissionsList = [
    { value: 'manage_users', label: 'Manage Users', icon: <PeopleAlt /> },
    { value: 'manage_reports', label: 'Manage Reports', icon: <BarChart /> },
    { value: 'manage_settings', label: 'System Settings', icon: <Settings /> },
    { value: 'manage_admins', label: 'Manage Admins', icon: <Shield /> },
    { value: 'view_analytics', label: 'View Analytics', icon: <Timeline /> },
    { value: 'manage_content', label: 'Manage Content', icon: <Category /> }
  ]

  const avatarColors = [
    '#2196f3', '#4caf50', '#ff9800', '#9c27b0', 
    '#f44336', '#00bcd4', '#8bc34a', '#ff5722'
  ]

  // Fixed: Add missing generatePassword function
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewAdmin(prev => ({ ...prev, password }))
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '—'
    const now = Date.now()
    const then = new Date(dateString).getTime()
    const diff = Math.max(0, now - then)

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  useEffect(() => {
    if (isAuthenticated && isAdmin && user) {
      fetchDashboardData()
    } else {
      navigate('/login')
    }
  }, [isAuthenticated, isAdmin, user])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [usersRes, statsRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/dashboard/stats')
      ])
      
      setUsers(usersRes.data.users || [])
      setFilteredUsers(usersRes.data.users || [])

      const apiStats = statsRes.data.stats || {}
      setStats((prev) => ({
        ...prev,
        ...apiStats,
        admins: apiStats.admins ?? apiStats.totalAdmins ?? prev.admins ?? 0,
        superAdmins: apiStats.superAdmins ?? apiStats.totalSuperAdmins ?? prev.superAdmins ?? 0,
        totalUsers: apiStats.totalUsers ?? prev.totalUsers ?? 0,
        activeUsers: apiStats.activeUsers ?? prev.activeUsers ?? 0
      }))
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Failed to fetch dashboard data')
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  useEffect(() => {
    filterAndSortUsers()
  }, [searchTerm, statusFilter, roleFilter, users, sortConfig])

  const recentActivities = useMemo(() => {
    if (!users?.length) return []

    return [...users]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4)
      .map((u, index) => ({
        user: u.name || u.email || 'Unknown user',
        action: u.createdAt ? 'created account' : 'activity recorded',
        time: formatTimeAgo(u.createdAt),
        color: ['success', 'error', 'info', 'warning'][index % 4]
      }))
  }, [users])

  const filterAndSortUsers = () => {
    let filtered = [...users]
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      )
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (roleFilter === 'super-admin') return user.isSuperAdmin
        if (roleFilter === 'admin') return user.role === 'admin' && !user.isSuperAdmin
        return user.role === roleFilter
      })
    }
    
    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    
    setFilteredUsers(filtered)
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleCreateAdmin = async () => {
    if (adminDialogStep < 2) {
      setAdminDialogStep(prev => prev + 1)
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.post('/admin/create-admin', newAdmin)
      
      setSuccess('Admin created successfully')
      setNewAdmin({
        email: '',
        name: '',
        password: '',
        role: 'admin',
        permissions: [],
        phone: '',
        department: '',
        avatarColor: '#2196f3'
      })
      setAdminDialogStep(0)
      setOpenDialog(false)
      fetchDashboardData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin')
    } finally {
      setLoading(false)
    }
  }

  const handleBackStep = () => {
    setAdminDialogStep(prev => Math.max(0, prev - 1))
  }

  const handleCloseAdminDialog = () => {
    setOpenDialog(false)
    setAdminDialogStep(0)
  }

  // Fixed: Add missing toggleUserStatus function
  const toggleUserStatus = async (userId, isActive) => {
    try {
      await apiClient.put(
        `/admin/users/${userId}/status`, 
        { isActive: !isActive }
      )
      
      setSuccess(`User ${isActive ? 'deactivated' : 'activated'} successfully`)
      fetchDashboardData()
    } catch (err) {
      setError('Failed to update user status')
    }
  }

  // Fixed: Add missing deleteUser function
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    
    try {
      await apiClient.delete(`/admin/users/${userId}`)
      
      setSuccess('User deleted successfully')
      fetchDashboardData()
    } catch (err) {
      setError('Failed to delete user')
    }
  }

  const handlePermissionToggle = (permission) => {
    setNewAdmin(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const handleActionMenuOpen = (event, user) => {
    setActionMenuAnchor(event.currentTarget)
    setSelectedActionUser(user)
  }

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null)
    setSelectedActionUser(null)
  }

  // Fixed: Add missing handleExportData function
  const handleExportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Created At'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.isSuperAdmin ? 'Super Admin' : user.role,
        user.isActive ? 'Active' : 'Inactive',
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.csv'
    a.click()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = (name) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const StatCard = ({ title, value, icon, color, growth, subtitle, trend }) => (
    <motion.div
      whileHover={{ scale: isMobile ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        p: isMobile ? 1.5 : 2,
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`
        }
      }}>
        <CardContent sx={{ p: 0 }}>
          <Stack direction={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'flex-start' : 'center'} justifyContent="space-between" spacing={isMobile ? 1 : 2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant={isMobile ? 'caption' : 'caption'} color="text.secondary" fontWeight="medium" sx={{ textTransform: 'uppercase', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                {title}
              </Typography>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" sx={{ mt: isMobile ? 0.5 : 1, fontSize: isMobile ? '1.5rem' : '2.125rem' }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: isMobile ? 0.25 : 0.5, fontSize: isMobile ? '0.65rem' : '0.75rem', lineHeight: 1.3 }}>
                  {subtitle}
                </Typography>
              )}
              {growth && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: isMobile ? 0.5 : 1 }}>
                  {trend === 'up' ? (
                    <ArrowUpward sx={{ fontSize: isMobile ? 12 : 14, color: 'success.main' }} />
                  ) : trend === 'down' ? (
                    <ArrowDownward sx={{ fontSize: isMobile ? 12 : 14, color: 'error.main' }} />
                  ) : null}
                  <Typography variant="caption" color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'} sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                    {growth}
                  </Typography>
                </Stack>
              )}
            </Box>
            <Box sx={{
              width: isMobile ? 44 : 56,
              height: isMobile ? 44 : 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.1)} 100%)`,
              border: `1px solid ${alpha(color, 0.3)}`,
              flexShrink: 0
            }}>
              {React.cloneElement(icon, { sx: { fontSize: isMobile ? 22 : 28, color } })}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  )

  const RoleChip = ({ role, superAdmin }) => {
    const config = {
      'super-admin': { color: 'warning', icon: <WorkspacePremium /> },
      'admin': { color: 'primary', icon: <Shield /> },
      'user': { color: 'default', icon: <Person /> }
    }
    
    const { color, icon } = config[superAdmin ? 'super-admin' : role] || config.user
    
    return (
      <Chip 
        icon={React.cloneElement(icon, { sx: { fontSize: 16 } })}
        label={superAdmin ? 'Super Admin' : role?.charAt(0).toUpperCase() + role?.slice(1)}
        color={color}
        size="small"
        sx={{ 
          fontWeight: 600,
          borderRadius: 1,
          px: 0.5
        }}
      />
    )
  }

  const StatusChip = ({ active }) => (
    <Chip 
      label={active ? 'Active' : 'Inactive'}
      color={active ? 'success' : 'error'}
      size="small"
      icon={active ? <CheckCircle sx={{ fontSize: 16 }} /> : <Cancel sx={{ fontSize: 16 }} />}
      sx={{ 
        fontWeight: 500,
        borderRadius: 1
      }}
    />
  )

  if (loading && !users.length) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.primary.dark}10 100%)`
      }}>
        <Stack alignItems="center" spacing={3}>
          <CircularProgress size={80} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Loading Dashboard...
          </Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: isMobile ? 2 : 4 }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: isMobile ? 3 : 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: isMobile ? 2 : 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1, overflow: 'auto' }}>
              <Link
                component="button"
                underline="hover"
                color="text.secondary"
                onClick={(e) => {
                  e.preventDefault()
                  const path = isAdminSubdomain ? '/home' : '/admin/home'
                  navigate(path)
                }}
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                <Home sx={{ mr: 0.5, fontSize: isMobile ? 18 : 20 }} />
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
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                <DashboardIcon sx={{ mr: 0.5, fontSize: isMobile ? 18 : 20 }} />
                Dashboard
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', fontSize: isMobile ? '0.875rem' : '1rem' }}>
                <Shield sx={{ mr: 0.5, fontSize: isMobile ? 18 : 20 }} />
                Admin Console
              </Typography>
            </Breadcrumbs>
            
            <Stack direction={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'flex-start' : 'center'} spacing={isMobile ? 1.5 : 2} sx={{ width: '100%' }}>
              <Avatar sx={{ 
                width: isMobile ? 44 : 56, 
                height: isMobile ? 44 : 56, 
                bgcolor: 'primary.main',
                border: `3px solid ${theme.palette.background.paper}`,
                boxShadow: theme.shadows[2],
                flexShrink: 0
              }}>
                <AdminPanelSettings sx={{ fontSize: isMobile ? 22 : 28 }} />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" fontWeight="bold" sx={{ 
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: isMobile ? '1.5rem' : '2.125rem'
                }}>
                  Admin Dashboard
                </Typography>
                <Typography variant={isMobile ? 'caption' : 'body1'} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: isMobile ? '0.75rem' : '1rem', flexWrap: 'wrap' }}>
                  <AccountCircle fontSize={isMobile ? 'small' : 'small'} />
                  Welcome back, <strong>{user?.name}</strong> • Last login: Today, 10:30 AM
                </Typography>
              </Box>
            </Stack>
          </Box>
          
          <Stack direction={isMobile ? 'column' : 'row'} spacing={isMobile ? 1 : 2} alignItems={isMobile ? 'stretch' : 'center'} sx={{ width: isMobile ? '100%' : 'auto' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh sx={{ fontSize: isMobile ? 18 : 20 }} />}
              onClick={fetchDashboardData}
              sx={{ borderRadius: 2, fontSize: isMobile ? '0.8rem' : '1rem', padding: isMobile ? '6px 12px' : '8px 16px', whiteSpace: 'nowrap' }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download sx={{ fontSize: isMobile ? 18 : 20 }} />}
              onClick={handleExportData}
              sx={{ borderRadius: 2, fontSize: isMobile ? '0.8rem' : '1rem', padding: isMobile ? '6px 12px' : '8px 16px', whiteSpace: 'nowrap' }}
            >
              Export Data
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Logout sx={{ fontSize: isMobile ? 18 : 20 }} />}
              onClick={handleLogout}
              sx={{ borderRadius: 2, fontSize: isMobile ? '0.8rem' : '1rem', padding: isMobile ? '6px 12px' : '8px 16px', whiteSpace: 'nowrap' }}
            >
              Logout
            </Button>
          </Stack>
        </Stack>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert 
                severity="error" 
                onClose={() => setError('')}
                sx={{ mb: 2, borderRadius: 2 }}
                icon={<Warning />}
              >
                {error}
              </Alert>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert 
                severity="success" 
                onClose={() => setSuccess('')}
                sx={{ mb: 2, borderRadius: 2 }}
                icon={<TaskAlt />}
              >
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Stats Overview - Enhanced */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 3 : 4 }}>
        {[
          { 
            title: 'Total Users', 
            value: stats.totalUsers, 
            icon: <Group />, 
            color: theme.palette.primary.main,
            growth: `+${stats.userGrowth}%`,
            subtitle: `${stats.todayActive || 24} active today`,
            trend: 'up'
          },
          { 
            title: 'Active Users', 
            value: stats.activeUsers, 
            icon: <CheckCircle />, 
            color: theme.palette.success.main,
            subtitle: `${((stats.activeUsers / stats.totalUsers) * 100 || 0).toFixed(1)}% of total`,
            trend: 'up'
          },
          { 
            title: 'Admin Users', 
            value: stats.admins ?? 0, 
            icon: <Security />, 
            color: theme.palette.warning.main,
            subtitle: `${stats.superAdmins ?? 0} super admins`,
            trend: 'stable'
          },
          { 
            title: 'Pending Verifications', 
            value: stats.pendingVerifications || 0, 
            icon: <HourglassEmpty />, 
            color: theme.palette.info.main,
            subtitle: 'Awaiting approval',
            trend: 'down'
          }
        ].map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* User Management Panel */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            height: '100%',
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[4]
            },
            transition: 'box-shadow 0.3s ease-in-out'
          }}>
            {/* Panel Header */}
            <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} sx={{ mb: isMobile ? 2 : 3, gap: isMobile ? 2 : 0 }}>
              <Box>
                <Typography variant={isMobile ? 'body1' : 'h6'} fontWeight="bold" gutterBottom sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
                  User Management
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                  Manage user accounts, permissions, and access levels
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PersonAdd sx={{ fontSize: isMobile ? 18 : 20 }} />}
                onClick={() => setOpenDialog(true)}
                sx={{ borderRadius: 2, fontSize: isMobile ? '0.8rem' : '1rem', padding: isMobile ? '6px 12px' : '8px 16px', whiteSpace: 'nowrap', width: isMobile ? '100%' : 'auto' }}
              >
                {isMobile ? 'Add Admin' : 'Add New Admin'}
              </Button>
            </Stack>

            {/* Search and Filter Bar */}
            <Paper sx={{ 
              p: isMobile ? 1.5 : 2, 
              mb: isMobile ? 2 : 3, 
              borderRadius: 2,
              background: theme.palette.background.default
            }}>
              <Grid container spacing={isMobile ? 1.5 : 2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder={isMobile ? "Search users..." : "Search users by name, email, or phone..."}
                    size={isMobile ? 'small' : 'small'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ fontSize: isMobile ? 18 : 20 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={roleFilter}
                      label="Role"
                      onChange={(e) => setRoleFilter(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      <MenuItem value="super-admin">Super Admin</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="user">User</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Users Table */}
            {loading ? (
              <LinearProgress sx={{ borderRadius: 2 }} />
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      {[
                        { key: 'name', label: 'User' },
                        { key: 'email', label: 'Email' },
                        { key: 'role', label: 'Role' },
                        { key: 'isActive', label: 'Status' },
                        { key: 'createdAt', label: 'Joined Date' },
                        { key: 'actions', label: 'Actions' }
                      ].map((column) => (
                        <TableCell key={column.key}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="subtitle2" fontWeight="600">
                              {column.label}
                            </Typography>
                            {column.key !== 'actions' && (
                              <IconButton 
                                size="small" 
                                onClick={() => handleSort(column.key)}
                                sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                              >
                                <Sort fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow 
                        key={user._id}
                        hover
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.04)
                          },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ 
                              bgcolor: avatarColors[user.name.length % avatarColors.length],
                              fontWeight: 'bold',
                              boxShadow: theme.shadows[1]
                            }}>
                              {getInitials(user.name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="500">
                                {user.name}
                              </Typography>
                              {user.department && (
                                <Typography variant="caption" color="text.secondary">
                                  {user.department}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email fontSize="small" />
                            {user.email}
                          </Typography>
                          {user.phone && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <Phone fontSize="small" />
                              {user.phone}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <RoleChip role={user.role} superAdmin={user.isSuperAdmin} />
                        </TableCell>
                        <TableCell>
                          <StatusChip active={user.isActive} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  setSelectedUser(user)
                                  setOpenUserDetails(true)
                                }}
                                sx={{ 
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={user.isActive ? "Deactivate" : "Activate"}>
                              <IconButton
                                size="small"
                                onClick={() => toggleUserStatus(user._id, user.isActive)}
                                sx={{ 
                                  bgcolor: user.isActive 
                                    ? alpha(theme.palette.error.main, 0.1)
                                    : alpha(theme.palette.success.main, 0.1),
                                  '&:hover': { 
                                    bgcolor: user.isActive 
                                      ? alpha(theme.palette.error.main, 0.2)
                                      : alpha(theme.palette.success.main, 0.2)
                                  }
                                }}
                              >
                                {user.isActive ? <Lock fontSize="small" /> : <LockOpen fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More Actions">
                              <IconButton
                                size="small"
                                onClick={(e) => handleActionMenuOpen(e, user)}
                                sx={{ 
                                  bgcolor: alpha(theme.palette.action.active, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.action.active, 0.2) }
                                }}
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredUsers.length === 0 && !loading && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <PeopleAlt sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No users found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search or filters
                    </Typography>
                  </Box>
                )}
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Side Panel - Quick Actions & Stats */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Quick Actions Card */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              boxShadow: theme.shadows[2]
            }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                {[
                  { icon: <FileDownload />, label: 'Export Data', color: 'primary', onClick: handleExportData },
                  { icon: <ContentCopy />, label: 'Copy User List', color: 'secondary', onClick: () => {
                    const userList = filteredUsers.map(u => `${u.name} (${u.email})`).join('\n')
                    navigator.clipboard.writeText(userList)
                    setSuccess('User list copied to clipboard')
                  }},
                  { icon: <Refresh />, label: 'Refresh Data', color: 'info', onClick: fetchDashboardData },
                  { icon: <BarChart />, label: 'View Analytics', color: 'success', onClick: () => {} },
                  { icon: <Settings />, label: 'System Settings', color: 'warning', onClick: () => {} }
                ].map((action, index) => (
                  <motion.div key={index} whileHover={{ x: 4 }}>
                    <Button
                      fullWidth
                      startIcon={action.icon}
                      variant="outlined"
                      color={action.color}
                      onClick={action.onClick}
                      sx={{ 
                        justifyContent: 'flex-start',
                        borderRadius: 2,
                        py: 1.5
                      }}
                    >
                      {action.label}
                    </Button>
                  </motion.div>
                ))}
              </Stack>
            </Paper>

            {/* Recent Activity */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              boxShadow: theme.shadows[2]
            }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              {recentActivities.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent activity to show.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {recentActivities.map((activity, index) => (
                    <Box key={index} sx={{ 
                      p: 2, 
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette[activity.color]?.main || theme.palette.grey[500], 0.05),
                      borderLeft: `3px solid ${theme.palette[activity.color]?.main || theme.palette.divider}`
                    }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {activity.user}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activity.action}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Enhanced Create Admin Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonAdd />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Create New Admin
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add a new administrator to the system
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Stepper activeStep={adminDialogStep} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Details</StepLabel>
            </Step>
            <Step>
              <StepLabel>Permissions</StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirmation</StepLabel>
            </Step>
          </Stepper>

          {/* Step 1: Details */}
          {adminDialogStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="text"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  helperText="Minimum 8 characters with letters, numbers, and special characters"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Key />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button 
                          size="small" 
                          onClick={generatePassword}
                          startIcon={<Refresh />}
                        >
                          Generate
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 2: Permissions */}
          {adminDialogStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Select Permissions
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    {permissionsList.map((perm) => (
                      <Grid item xs={12} sm={6} key={perm.value}>
                        <Paper
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: `2px solid ${
                              newAdmin.permissions.includes(perm.value)
                                ? theme.palette.primary.main
                                : theme.palette.divider
                            }`,
                            borderRadius: 2,
                            bgcolor: newAdmin.permissions.includes(perm.value)
                              ? alpha(theme.palette.primary.main, 0.05)
                              : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.02)
                            }
                          }}
                          onClick={() => handlePermissionToggle(perm.value)}
                        >
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Box sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: newAdmin.permissions.includes(perm.value)
                                ? alpha(theme.palette.primary.main, 0.1)
                                : alpha(theme.palette.action.disabled, 0.1)
                            }}>
                              {React.cloneElement(perm.icon, {
                                sx: { 
                                  color: newAdmin.permissions.includes(perm.value)
                                    ? theme.palette.primary.main
                                    : theme.palette.text.secondary
                                }
                              })}
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {perm.label}
                              </Typography>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={newAdmin.permissions.includes(perm.value)}
                                    onChange={() => handlePermissionToggle(perm.value)}
                                    size="small"
                                  />
                                }
                                label=""
                                sx={{ mt: 0.5, mr: 0 }}
                              />
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Step 3: Confirmation */}
          {adminDialogStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Review Admin Details</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Email</Typography>
                  <Typography variant="body2" fontWeight="500" sx={{ mb: 2 }}>{newAdmin.email || '—'}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Full Name</Typography>
                  <Typography variant="body2" fontWeight="500">{newAdmin.name || '—'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Permissions ({newAdmin.permissions.length})</Typography>
                  <Stack spacing={1}>
                    {newAdmin.permissions.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No permissions selected</Typography>
                    ) : (
                      newAdmin.permissions.map((perm) => (
                        <Typography key={perm} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          ✓ {permissionsList.find(p => p.value === perm)?.label}
                        </Typography>
                      ))
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 1, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1}>
            <Button 
              onClick={handleCloseAdminDialog}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            {adminDialogStep > 0 && (
              <Button 
                onClick={handleBackStep}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Back
              </Button>
            )}
          </Stack>
          <Button 
            onClick={handleCreateAdmin} 
            variant="contained"
            disabled={adminDialogStep === 0 && (!newAdmin.email || !newAdmin.name || !newAdmin.password)}
            sx={{ 
              borderRadius: 2,
              px: 4,
              boxShadow: theme.shadows[2]
            }}
          >
            {adminDialogStep === 2 ? 'Create Admin Account' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog 
        open={openUserDetails} 
        onClose={() => setOpenUserDetails(false)} 
        maxWidth="md"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: selectedUser.isSuperAdmin ? 'warning.main' : 'primary.main' }}>
                  {getInitials(selectedUser.name)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedUser.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold">
                    USER INFORMATION
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="User ID"
                          secondary={selectedUser._id}
                          secondaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Full Name"
                          secondary={selectedUser.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Email"
                          secondary={selectedUser.email}
                        />
                      </ListItem>
                      {selectedUser.phone && (
                        <ListItem>
                          <ListItemText 
                            primary="Phone"
                            secondary={selectedUser.phone}
                          />
                        </ListItem>
                      )}
                      <ListItem>
                        <ListItemText 
                          primary="Role"
                          secondary={
                            <Chip 
                              label={selectedUser.isSuperAdmin ? 'Super Admin' : selectedUser.role}
                              color={selectedUser.isSuperAdmin ? 'warning' : selectedUser.role === 'admin' ? 'primary' : 'default'}
                              size="small"
                              icon={selectedUser.isSuperAdmin ? <AdminPanelSettings /> : undefined}
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Status"
                          secondary={
                            <Chip 
                              label={selectedUser.isActive ? 'Active' : 'Inactive'}
                              color={selectedUser.isActive ? 'success' : 'error'}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold">
                    ACCOUNT DETAILS
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Account Created"
                          secondary={new Date(selectedUser.createdAt).toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Last Updated"
                          secondary={new Date(selectedUser.updatedAt).toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Last Login"
                          secondary={selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Email Verified"
                          secondary={
                            <Chip 
                              label={selectedUser.isEmailVerified ? 'Verified' : 'Not Verified'}
                              color={selectedUser.isEmailVerified ? 'success' : 'warning'}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
              <Button onClick={() => setOpenUserDetails(false)}>
                Close
              </Button>
              <Button 
                variant="contained"
                color={selectedUser.isActive ? 'error' : 'success'}
                onClick={() => {
                  toggleUserStatus(selectedUser._id, selectedUser.isActive)
                  setOpenUserDetails(false)
                }}
              >
                {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: { 
            borderRadius: 2,
            minWidth: 200,
            boxShadow: theme.shadows[4]
          }
        }}
      >
        {selectedActionUser && (
          <>
            <MenuItem 
              onClick={() => {
                setSelectedUser(selectedActionUser)
                setOpenUserDetails(true)
                handleActionMenuClose()
              }}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <Visibility fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="View Details" />
            </MenuItem>
            <MenuItem 
              onClick={() => {
                toggleUserStatus(selectedActionUser._id, selectedActionUser.isActive)
                handleActionMenuClose()
              }}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                {selectedActionUser.isActive ? (
                  <Lock fontSize="small" />
                ) : (
                  <LockOpen fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={selectedActionUser.isActive ? "Deactivate User" : "Activate User"} 
              />
            </MenuItem>
            <MenuItem 
              onClick={() => {
                navigator.clipboard.writeText(selectedActionUser.email)
                setSuccess('Email copied to clipboard')
                handleActionMenuClose()
              }}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <ContentCopy fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Copy Email" />
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${selectedActionUser.name}?`)) {
                  deleteUser(selectedActionUser._id)
                  handleActionMenuClose()
                }
              }}
              sx={{ 
                py: 1.5,
                color: 'error.main',
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1)
                }
              }}
            >
              <ListItemIcon sx={{ color: 'error.main' }}>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Delete User" />
            </MenuItem>
          </>
        )}
      </Menu>
    </Container>
  )
}

export default AdminDashboard