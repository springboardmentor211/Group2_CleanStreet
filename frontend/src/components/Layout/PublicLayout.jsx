import React, { useState, useCallback, useMemo, memo } from 'react'
import { 
  AppBar, Toolbar, Typography, Button, Box, Container,
  IconButton, Drawer, List, ListItem, ListItemText,
  useTheme, useMediaQuery, alpha, Menu, MenuItem, Avatar
} from '@mui/material'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import HomeIcon from '@mui/icons-material/Home'
import LoginIcon from '@mui/icons-material/Login'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../../contexts/AuthContext'
import logoSvg from '../../assets/images/logo.svg'

// Memoized NavLink component
const NavLink = memo(({ to, label, icon: Icon, mobile = false, onClick, isActive }) => {
  const theme = useTheme()

  if (mobile) {
    return (
      <ListItem 
        component={RouterLink} 
        to={to}
        onClick={onClick}
        sx={{
          borderRadius: 2,
          mb: 1,
          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }
        }}
      >
        {Icon && (
          <Icon 
            sx={{ 
              mr: 2, 
              color: isActive ? 'primary.main' : 'text.secondary',
              fontSize: '1.2rem'
            }} 
          />
        )}
        <ListItemText 
          primary={label}
          primaryTypographyProps={{
            fontWeight: isActive ? 700 : 500,
            color: isActive ? 'primary.main' : 'text.primary'
          }}
        />
      </ListItem>
    )
  }

  return (
    <Button
      component={RouterLink}
      to={to}
      startIcon={Icon && <Icon />}
      sx={{
        fontWeight: isActive ? 700 : 500,
        textTransform: 'none',
        fontSize: '0.95rem',
        px: 2,
        py: 1,
        borderRadius: 2,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: isActive ? '80%' : 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          transform: 'translateX(-50%)',
          transition: 'width 0.3s ease',
          borderRadius: 3
        },
        '&:hover:not(:disabled)': {
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          '&:after': {
            width: '80%'
          }
        }
      }}
    >
      {label}
    </Button>
  )
})

NavLink.displayName = 'NavLink'

// Memoized Logo component
const Logo = memo(({ onClick }) => {
  const theme = useTheme()

  return (
    <Box 
      component={RouterLink} 
      to="/" 
      onClick={onClick}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        textDecoration: 'none',
        '&:hover': {
          '& .logo-icon': {
            transform: 'rotate(-10deg) scale(1.1)'
          }
        }
      }}
    >
      <Box
        component="img"
        src={logoSvg}
        alt="Clean Street"
        className="logo-icon"
        sx={{ 
          height: 40,
          width: 40,
          transition: 'transform 0.3s ease'
        }} 
      />
      <Box>
        <Typography 
          variant="h5" 
          color="primary" 
          sx={{ 
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.5px'
          }}
        >
          Clean Street
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontWeight: 500,
            display: { xs: 'none', sm: 'block' }
          }}
        >
          Making cities better, together
        </Typography>
      </Box>
    </Box>
  )
})

Logo.displayName = 'Logo'

// Memoized ReportButton component
const ReportButton = memo(({ onClick, mobile = false, fullWidth = false }) => {
  const theme = useTheme()

  return (
    <Button
      component={'button'}
      variant="contained"
      startIcon={<ReportProblemIcon />}
      onClick={onClick}
      fullWidth={fullWidth}
      sx={{
        py: mobile ? 1.5 : 1,
        px: mobile ? 2 : 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        fontWeight: 700,
        fontSize: mobile ? '1rem' : '0.95rem',
        textTransform: 'none',
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
        },
        transition: 'all 0.3s ease'
      }}
    >
      Report Issue
    </Button>
  )
})

// Memoized ProfileMenu component
const ProfileMenu = memo(({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const theme = useTheme()

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    onLogout()
  }

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        sx={{
          p: 0.5,
          border: `2px solid ${theme.palette.primary.main}`,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.1)
          }
        }}
      >
        <Avatar
          src={user?.profilePicture || undefined}
          sx={{
            width: 32,
            height: 32,
            bgcolor: theme.palette.primary.main,
            fontSize: '0.9rem',
            fontWeight: 700
          }}
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: 2,
            minWidth: 200,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <MenuItem
          component={RouterLink}
          to="/profile"
          onClick={handleMenuClose}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          <PersonIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Profile
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1)
            }
          }}
        >
          <LogoutIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </>
  )
})

ProfileMenu.displayName = 'ProfileMenu'

// Memoized MobileProfileMenu component
const MobileProfileMenu = memo(({ user, onLogout, onClose }) => {
  const theme = useTheme()

  return (
    <>
      <ListItem 
        component={RouterLink} 
        to="/profile"
        onClick={onClose}
        sx={{
          borderRadius: 2,
          mb: 1,
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }
        }}
      >
        <PersonIcon 
          sx={{ 
            mr: 2, 
            color: 'text.secondary',
            fontSize: '1.2rem'
          }} 
        />
        <ListItemText 
          primary="Profile"
          primaryTypographyProps={{
            fontWeight: 500,
            color: 'text.primary'
          }}
        />
      </ListItem>
      <ListItem 
        onClick={() => {
          onClose()
          onLogout()
        }}
        sx={{
          borderRadius: 2,
          mb: 1,
          color: 'error.main',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.05)
          }
        }}
      >
        <LogoutIcon 
          sx={{ 
            mr: 2, 
            color: 'error.main',
            fontSize: '1.2rem'
          }} 
        />
        <ListItemText 
          primary="Logout"
          primaryTypographyProps={{
            fontWeight: 500,
            color: 'error.main'
          }}
        />
      </ListItem>
    </>
  )
})

MobileProfileMenu.displayName = 'MobileProfileMenu'

ReportButton.displayName = 'ReportButton'

// Memoized Footer component
const Footer = memo(() => {
  const theme = useTheme()
  
  const quickLinks = useMemo(() => [
    { to: '/terms', label: 'Terms' },
    { to: '/privacy', label: 'Privacy' },
    { to: '/contact', label: 'Contact' },
  ], [])

  return (
    <Box 
      component="footer" 
      sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        py: 2,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,249,255,0.98) 100%)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: { xs: 1, md: 2 }
        }}>
          {/* Logo and Tagline */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={logoSvg}
              alt="Clean Street"
              sx={{ height: 24, width: 24 }}
            />
            <Box>
              <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Clean Street
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                Community-powered city improvement
              </Typography>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 } }}>
            {quickLinks.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                size="small"
                sx={{ 
                  fontWeight: 500, 
                  textTransform: 'none',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          {/* Copyright - Inline on desktop */}
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            © {new Date().getFullYear()} Clean Street
          </Typography>
        </Box>

        {/* Copyright - Mobile only */}
        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center"
          sx={{ 
            mt: 1,
            display: { xs: 'block', md: 'none' }
          }}
        >
          © {new Date().getFullYear()} Clean Street
        </Typography>
      </Container>
    </Box>
  )
})

Footer.displayName = 'Footer'

// Memoized MobileDrawer component
const MobileDrawer = memo(({ 
  open, 
  onClose, 
  navLinks, 
  handleReportIssue,
  theme,
  isAuthenticated,
  user,
  onLogout
}) => {
  const location = useLocation()
  
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 280,
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,249,255,0.98) 100%)'
        },
      }}
    >
      <Box sx={{ width: 280, p: 2, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={logoSvg}
              alt="Clean Street"
              sx={{ height: 32, width: 32 }}
            />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
              Clean Street
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <List sx={{ px: 1 }}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              label={link.label}
              icon={link.icon}
              mobile
              onClick={onClose}
              isActive={location.pathname === link.to}
            />
          ))}
          {isAuthenticated && (
            <MobileProfileMenu
              user={user}
              onLogout={onLogout}
              onClose={onClose}
            />
          )}
        </List>
        
        <Box sx={{ p: 2, mt: 2 }}>
          <ReportButton
            mobile
            fullWidth
            onClick={() => {
              onClose()
              handleReportIssue()
            }}
          />
        </Box>
      </Box>
    </Drawer>
  )
})

MobileDrawer.displayName = 'MobileDrawer'

// Main PublicLayout component
const PublicLayout = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()

  // Memoized navLinks array - show dashboard if authenticated, login if not
  const navLinks = useMemo(() => {
    const links = [
      { to: '/', label: 'Home', icon: HomeIcon },
    ]
    
    if (!isAuthenticated) {
      links.push({ to: '/login', label: 'Login', icon: LoginIcon })
    } else {
      // Show dashboard link for authenticated users
      const DashboardIcon = () => <PersonIcon />
      links.push({ to: '/dashboard', label: 'Dashboard', icon: DashboardIcon })
    }
    
    return links
  }, [isAuthenticated])

  // Memoized callbacks
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev)
  }, [])

  const handleReportIssue = useCallback(() => {
    if (isAuthenticated) {
      navigate('/report-issue')
    } else {
      navigate('/login', { state: { from: '/report-issue' } })
    }
  }, [navigate, isAuthenticated])

  const handleLogout = useCallback(() => {
    logout()
    navigate('/')
  }, [logout, navigate])

  const handleLogoClick = useCallback(() => {
    if (mobileOpen) {
      setMobileOpen(false)
    }
  }, [mobileOpen])

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
      pb: { xs: '130px', md: '60px' }
    }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,255,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          py: 0.5
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            {/* Logo */}
            <Logo onClick={handleLogoClick} />

            {/* Desktop Navigation */}
            {!isMobile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    label={link.label}
                    icon={link.icon}
                    isActive={location.pathname === link.to}
                  />
                ))}
                {isAuthenticated && (
                  <ProfileMenu
                    user={user}
                    onLogout={handleLogout}
                  />
                )}
                <ReportButton onClick={handleReportIssue} />
              </Box>
            ) : (
              // Mobile Menu Button
              <IconButton
                color="primary"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      {isMobile && (
        <MobileDrawer
          open={mobileOpen}
          onClose={handleDrawerToggle}
          navLinks={navLinks}
          handleReportIssue={handleReportIssue}
          theme={theme}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  )
}

// Export memoized PublicLayout
export default memo(PublicLayout)




