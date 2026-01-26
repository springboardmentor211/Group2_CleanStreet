import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import logoSvg from '../../assets/images/logo.svg'

const drawerWidth = 240

const AdminLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  // Debug logging
  React.useEffect(() => {
    console.log('🔐 AdminLayout auth state:', {
      user: user?.email,
      isAdmin,
      role: user?.role,
      isSuperAdmin: user?.isSuperAdmin
    })
  }, [user, isAdmin])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await logout()
    handleClose()
  }

  const isAdminSubdomain = typeof window !== 'undefined' && 
    window.location.hostname.startsWith('admin.')

  const menuItems = [
    { 
      text: 'Home', 
      icon: <HomeIcon />, 
      path: isAdminSubdomain ? '/home' : '/admin/home' 
    },
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: isAdminSubdomain ? '/dashboard' : '/admin/dashboard' 
    },
    { 
      text: 'Users', 
      icon: <PeopleIcon />, 
      path: isAdminSubdomain ? '/users' : '/admin/users' 
    },
    { 
      text: 'Reports', 
      icon: <AssignmentIcon />, 
      path: isAdminSubdomain ? '/reports' : '/admin/reports' 
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: isAdminSubdomain ? '/settings' : '/admin/settings' 
    }
  ]

  const drawer = (
    <Box>
      <Toolbar sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box
            component="img"
            src={logoSvg}
            alt="Clean Street"
            sx={{ height: 32, width: 32 }}
          />
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Clean Street Administration
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path)
                if (isMobile) setMobileOpen(false)
              }}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? 'primary.contrastText' : 'inherit' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          ml: 0,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: 'inline-flex' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Admin Dashboard'}
          </Typography>

          <IconButton color="inherit" sx={{ mr: 1 }}>
            <NotificationsIcon />
          </IconButton>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.name}
                </Typography>
                <Chip 
                  label={user.isSuperAdmin ? 'Super Admin' : 'Admin'} 
                  size="small" 
                  color={user.isSuperAdmin ? 'error' : 'primary'}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
              <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2">{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: 0, flexShrink: 0 }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: 8,
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default AdminLayout
