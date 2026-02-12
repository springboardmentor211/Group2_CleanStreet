import React, { useRef, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Stack,
  Avatar
} from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const { user, refreshUser } = useAuth()
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    auditLogs: true,
    darkMode: false
  })

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [message, setMessage] = useState('')

  const handlePrefToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
    setMessage('Preferences updated locally (wire to backend when ready).')
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setMessage('Please fill in all password fields.')
      return
    }
    if (passwords.next !== passwords.confirm) {
      setMessage('New passwords do not match.')
      return
    }
    // TODO: wire to backend password change endpoint
    setMessage('Password change request prepared (hook API when available).')
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

      const response = await fetch('/api/auth/upload-profile-picture', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Profile picture updated')
        refreshUser()
      } else {
        throw new Error(data.error || 'Failed to upload profile picture')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload profile picture')
    } finally {
      setImageUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Admin Settings
      </Typography>

      {message && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Profile</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={user?.profilePicture || undefined}
                  sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </Avatar>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCamera />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    sx={{ textTransform: 'none' }}
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
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                value={user?.name || ''}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                value={user?.email || ''}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Role"
                value={user?.isSuperAdmin ? 'Super Admin' : user?.role || 'Admin'}
                fullWidth
                disabled
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Preferences</Typography>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications}
                  onChange={() => handlePrefToggle('emailNotifications')}
                />
              }
              label="Email notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.auditLogs}
                  onChange={() => handlePrefToggle('auditLogs')}
                />
              }
              label="Audit logging for admin actions"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.darkMode}
                  onChange={() => handlePrefToggle('darkMode')}
                />
              }
              label="Prefer dark mode (local setting)"
            />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Security</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Change password (connect to backend endpoint when available).
          </Typography>
          <Box
            component="form"
            onSubmit={handlePasswordSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 420 }}
          >
            <TextField
              type="password"
              label="Current password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              fullWidth
            />
            <TextField
              type="password"
              label="New password"
              value={passwords.next}
              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
              fullWidth
            />
            <TextField
              type="password"
              label="Confirm new password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              fullWidth
            />
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained">Save</Button>
              <Button
                type="button"
                variant="text"
                onClick={() => setPasswords({ current: '', next: '', confirm: '' })}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Box>
  )
}

export default AdminSettings
