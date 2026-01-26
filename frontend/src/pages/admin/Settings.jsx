import React, { useState } from 'react'
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
  Stack
} from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'

const AdminSettings = () => {
  const { user } = useAuth()

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
