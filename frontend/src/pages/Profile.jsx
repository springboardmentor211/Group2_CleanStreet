import React, { useState } from 'react'
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import BadgeIcon from '@mui/icons-material/Badge'
import SaveIcon from '@mui/icons-material/Save'

const Profile = () => {
  const theme = useTheme()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || ''
  })

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        {
          name: formData.name,
          phone: formData.phone
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const roleColors = {
    'citizen': 'info',
    'volunteer': 'success',
    'admin': 'warning',
    'super-admin': 'error'
  }

  const getRoleLabel = (role) => {
    return role
      ?.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'User'
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: theme.palette.primary.main,
              fontSize: '2.5rem',
              fontWeight: 700
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {user?.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: theme.palette[roleColors[user?.role] || 'default'].main,
                  color: 'white',
                  fontWeight: 600
                }}
              >
                {getRoleLabel(user?.role)}
              </Typography>
              {user?.isSuperAdmin && (
                <Typography
                  variant="body2"
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: theme.palette.warning.main,
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  Super Admin
                </Typography>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Profile Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Personal Information
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                value={formData.email}
                disabled
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={getRoleLabel(formData.role)}
                disabled
                InputProps={{
                  startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                helperText="Role cannot be changed"
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Only your name and phone number can be updated. To change your password, use the forgot password option on the login page.
          </Alert>

          <Button
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Additional Info */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Account Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                User ID
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {user?.id}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                Account Status
              </Typography>
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                Active
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default Profile
