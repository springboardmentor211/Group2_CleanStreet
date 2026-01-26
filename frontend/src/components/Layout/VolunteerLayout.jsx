import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Divider,
  IconButton,
  Badge,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  VolunteerActivism as VolunteerIcon,
  Notifications as NotificationsIcon,
  Map as MapIcon,
  History as HistoryIcon,
  Home as HomeIcon
} from '@mui/icons-material'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const drawerWidth = 280

const VolunteerLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/volunteer/login')
  }

  // Volunteer-specific menu items
  const volunteerMenuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/volunteer/dashboard',
      description: 'Overview of your activities'
    },
    {
      text: 'Assigned Issues',
      icon: <AssignmentIcon />,
      path: '/volunteer/issues',
      description: 'Tasks assigned to you',
      badge: true // Will show count from API
    },
    {
      text: 'Active Tasks',
      icon: <ScheduleIcon />,
      path: '/volunteer/tasks/active',
      description: 'Issues you are working on'
    },
    {
      text: 'Completed Tasks',
      icon: <CheckCircleIcon />,
      path: '/volunteer/tasks/completed',
      description: 'Issues you have resolved'
    },
    {
      text: 'Zone Map',
      icon: <MapIcon />,
      path: '/volunteer/map',
      description: 'View issues on map'
    },
    {
      text: 'Performance',
      icon: <TrendingUpIcon />,
      path: '/volunteer/performance',
      description: 'Your ratings and stats'
    },
    {
      text: 'Task History',
      icon: <HistoryIcon />,
      path: '/volunteer/history',
      description: 'All your completed tasks'
    }
  ]

  const secondaryMenuItems = [
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/volunteer/profile',
      description: 'Your volunteer profile'
    },
    {
      text: 'Back to Home',
      icon: <HomeIcon />,
      path: '/',
      description: 'Return to main site'
    }
  ]

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Volunteer Header */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        bgcolor: '#4CAF50',
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        color: 'white'
      }}>
        <VolunteerIcon sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Clean Street Volunteer
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Making Communities Cleaner
        </Typography>
      </Box>

      {/* Volunteer Info */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        borderBottom: '1px solid rgba(0,0,0,0.08)'
      }}>
        <Avatar 
          sx={{ 
            bgcolor: '#2196F3',
            width: 56,
            height: 56,
            fontSize: '1.25rem',
            fontWeight: 'bold'
          }}
        >
          {user?.name?.charAt(0).toUpperCase() || 'V'}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {user?.name || 'Volunteer'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {user?.role === 'volunteer' ? 'Verified Volunteer' : user?.role}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationIcon fontSize="small" />
            {user?.location || 'Your Area'}
            {user?.zone && ` • ${user.zone}`}
          </Typography>
        </Box>
      </Box>

      {/* Main Menu */}
      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
        <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 'medium', mb: 1, display: 'block' }}>
          VOLUNTEER TOOLS
        </Typography>
        {volunteerMenuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            button
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              py: 1.25,
              '&.Mui-selected': {
                backgroundColor: '#E8F5E9',
                borderLeft: '4px solid #4CAF50',
                '&:hover': {
                  backgroundColor: '#C8E6C9'
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? '#4CAF50' : 'rgba(0, 0, 0, 0.54)',
              minWidth: 40
            }}>
              {item.badge ? (
                <Badge badgeContent={3} color="error" variant="dot">
                  {item.icon}
                </Badge>
              ) : item.icon}
            </ListItemIcon>
            <Box sx={{ flex: 1 }}>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? '600' : '400',
                  fontSize: '0.9375rem'
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                {item.description}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Secondary Menu */}
      <List sx={{ px: 1, py: 2 }}>
        <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 'medium', mb: 1, display: 'block' }}>
          ACCOUNT
        </Typography>
        {secondaryMenuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            button
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              py: 1.25,
              '&.Mui-selected': {
                backgroundColor: '#E8F5E9',
                '&:hover': {
                  backgroundColor: '#C8E6C9'
                }
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? '#4CAF50' : 'rgba(0, 0, 0, 0.54)',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <Box sx={{ flex: 1 }}>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? '600' : '400',
                  fontSize: '0.9375rem'
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                {item.description}
              </Typography>
            </Box>
          </ListItem>
        ))}
        
        {/* Logout */}
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            py: 1.25,
            color: '#f44336',
            '&:hover': {
              backgroundColor: '#FFEBEE'
            }
          }}
        >
          <ListItemIcon sx={{ color: '#f44336', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: '400',
              fontSize: '0.9375rem'
            }}
          />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: '#4CAF50'
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" noWrap sx={{ 
              fontWeight: 'bold', 
              color: '#2E7D32',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <VolunteerIcon fontSize="small" />
              Volunteer Portal
            </Typography>
            {user?.zone && (
              <Typography variant="caption" sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center', 
                gap: 0.5, 
                color: 'text.secondary',
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                px: 1.5,
                py: 0.5,
                borderRadius: 1
              }}>
                <LocationIcon fontSize="small" />
                Zone: {user.zone}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit" sx={{ color: '#4CAF50' }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            {isMobile ? (
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#4CAF50' }}>
                {user?.name?.charAt(0).toUpperCase() || 'V'}
              </Avatar>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {user?.name?.split(' ')[0] || 'Volunteer'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {user?.id?.substring(0, 8)}...
                  </Typography>
                </Box>
                <Avatar sx={{ width: 40, height: 40, bgcolor: '#4CAF50' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'V'}
                </Avatar>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f8f9fa',
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* Spacing for AppBar */}
        <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}

export default VolunteerLayout