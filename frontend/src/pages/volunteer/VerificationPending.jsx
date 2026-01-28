import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Stack,
  Alert,
  Chip,
  Grid,
  Divider,
  useTheme,
  alpha
} from '@mui/material'
import {
  HourglassEmpty,
  CheckCircle,
  Email,
  VerifiedUser,
  VolunteerActivism,
  Info,
  AccessTime
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const VerificationPending = () => {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh user data every 5 seconds to check verification status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await refreshUser()
      } catch (error) {
        console.error('Failed to refresh user status:', error)
      }
    }

    // Check immediately on mount
    checkStatus()

    // Then check every 5 seconds
    const interval = setInterval(() => {
      checkStatus()
      setRefreshKey(prev => prev + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, []) // Empty dependency array to avoid re-creating interval

  // If user is verified, redirect to dashboard
  useEffect(() => {
    if (user?.volunteer_status === 'active') {
      navigate('/dashboard')
    }
  }, [user?.volunteer_status, navigate])

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Grid container spacing={3}>
        {/* Left Side - Info */}
        <Grid item xs={12} md={5}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <VolunteerActivism sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Welcome, {user?.name}!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your registration is being verified
                </Typography>
              </Box>
            </Box>

            <Paper elevation={0} sx={{
              p: 3,
              mb: 3,
              bgcolor: alpha(theme.palette.info.main, 0.1),
              borderRadius: 3,
              border: `2px solid ${theme.palette.info.main}`
            }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'info.main' }}>
                ⏳ Verification Under Process
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your volunteer account is pending admin verification. This process usually takes 24-48 hours.
              </Typography>
            </Paper>

            {/* Progress Steps */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Registration Progress:
                </Typography>

                <Box sx={{ mt: 3 }}>
                  {/* Step 1: Email Verification */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start' }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 28, flexShrink: 0, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'success.main' }}>
                        Email Verified
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Step 2: Admin Verification (Current) */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <HourglassEmpty sx={{ color: 'warning.main', fontSize: 28, flexShrink: 0, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'warning.main' }}>
                        Admin Verification
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pending review from Clean Street admin team
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Right Side - Status Card */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{
            p: 4,
            textAlign: 'center',
            background: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.8)
              : '#ffffff',
            borderRadius: 3,
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Animated Hourglass Icon */}
            <Box sx={{
              fontSize: 80,
              mb: 3,
              animation: 'spin 3s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotateZ(0deg)' },
                '50%': { transform: 'rotateZ(180deg)' },
                '100%': { transform: 'rotateZ(360deg)' }
              }
            }}>
              ⏳
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Verification Pending
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
              Your volunteer account is being reviewed by our admin team. Once approved, you'll be able to:
            </Typography>

            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 400, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2">Join volunteer events</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2">Track volunteer hours</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2">Respond to community reports</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2">Earn badges and rewards</Typography>
              </Box>
            </Stack>

            <Alert severity="info" sx={{ width: '100%', mb: 3 }}>
              <AccessTime sx={{ mr: 1, fontSize: 18 }} />
              Typical verification time: 24-48 hours
            </Alert>

            {/* Refresh Status Button */}
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{ mb: 2 }}
            >
              Refresh Status
            </Button>

            {/* Check Email Section */}
            <Divider sx={{ width: '100%', my: 3 }} />

            <Box sx={{ width: '100%', p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Email sx={{ color: 'info.main', fontSize: 24 }} />
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'info.main' }}>
                  Check Your Email
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                We'll send you an email notification as soon as your account is verified. Keep an eye on your inbox!
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default VerificationPending
