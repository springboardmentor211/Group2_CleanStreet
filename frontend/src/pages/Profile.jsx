import React, { useEffect, useRef, useState } from 'react'
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
import PhotoCamera from '@mui/icons-material/PhotoCamera'

const Profile = () => {
  const theme = useTheme()
  const { user, isAuthenticated, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '')
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || ''
  })

  useEffect(() => {
    if (user) {
      setProfilePicture(user.profilePicture || '')
    }
  }, [user])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || ''
      })
    }
  }, [user])

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const normalized = value.replace(/[^0-9+]/g, '')
      setFormData(prev => ({
        ...prev,
        phone: normalized
      }))
      return
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const isPhoneValid = (phone) => {
    if (!phone) return true
    return /^(\+91)?[6-9][0-9]{9}$/.test(phone)
  }

  const phoneHasError = !isPhoneValid(formData.phone)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.put(
        '/api/auth/profile',
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
        if (response.data.user) {
          setFormData({
            name: response.data.user.name || '',
            email: response.data.user.email || '',
            phone: response.data.user.phone || '',
            role: response.data.user.role || ''
          })
          setProfilePicture(response.data.user.profilePicture || '')
        }
        refreshUser()
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      return
    }

    setImageUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const response = await axios.post('/api/auth/upload-profile-picture', formDataUpload, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        setProfilePicture(response.data.image.url)
        toast.success('Profile picture updated')
        refreshUser()
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload profile picture')
    } finally {
      setImageUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
            src={profilePicture || undefined}
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
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              sx={{ textTransform: 'none', mb: 1 }}
            >
              {imageUploading ? 'Uploading...' : 'Change Photo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              style={{ display: 'none' }}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              JPG, PNG, or WebP up to 10MB
            </Typography>
          </Box>
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
                error={phoneHasError}
                helperText={phoneHasError ? 'Use Indian mobile format (10 digits starting 6-9, optional +91)' : 'Format: +91XXXXXXXXXX or 10 digits'}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                inputProps={{
                  inputMode: 'tel',
                  pattern: '(\\+91)?[6-9][0-9]{9}',
                  maxLength: 13
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
            disabled={loading || phoneHasError}
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
