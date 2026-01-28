import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  InputAdornment,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Fade
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import axios from 'axios'
import toast from 'react-hot-toast'

const VerifyEmailVolunteer = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  
  const emailFromState = location.state?.email || ''
  const nameFromState = location.state?.name || ''
  
  const [email, setEmail] = useState(emailFromState)
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timer, setTimer] = useState(0)
  const [verificationComplete, setVerificationComplete] = useState(false)

  // Countdown timer for resend
  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !otp) {
      setError('Please enter email and OTP')
      return
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Step 1: Verify email with OTP
      const verifyResponse = await axios.post(
        '/api/auth/verify-email',
        { email, otp },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (verifyResponse.data.success) {
        setSuccess('✅ Email verified successfully!')
        toast.success('Logging you in...')
        
        // Step 2: Auto-login with email and password from registration
        // Get password from localStorage (stored during registration)
        const storedPassword = localStorage.getItem(`volunteer_password_${email}`)
        
        if (storedPassword) {
          try {
            const loginResponse = await axios.post(
              '/api/auth/login',
              { email, password: storedPassword },
              {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
              }
            )

            if (loginResponse.data.success) {
              toast.success('Welcome to Clean Street Volunteers!')
              setVerificationComplete(true)
              
              // Clear stored password
              localStorage.removeItem(`volunteer_password_${email}`)
              
              // Redirect to volunteer dashboard after 1 second
              setTimeout(() => {
                navigate('/dashboard')
              }, 1000)
            }
          } catch (loginErr) {
            console.error('Auto-login error:', loginErr)
            setSuccess('Email verified! Please login with your password.')
            // Fall back to redirect to login page
            setTimeout(() => {
              navigate('/login')
            }, 2000)
          }
        } else {
          // No stored password, redirect to login
          setSuccess('Email verified! Redirecting to login...')
          setTimeout(() => {
            navigate('/login')
          }, 2000)
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Verification failed'
      console.error('Verification error:', err)
      setError(errorMsg)
      toast.error(`❌ ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      setError('Email is required')
      return
    }

    setResending(true)
    setError('')

    try {
      const response = await axios.post(
        '/api/auth/resend-otp',
        { email },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (response.data.success) {
        setSuccess('OTP sent to your email!')
        toast.success('New OTP sent to your email')
        setOtp('')
        setTimer(60)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to resend OTP'
      setError(errorMsg)
      toast.error(`❌ ${errorMsg}`)
    } finally {
      setResending(false)
    }
  }

  if (verificationComplete) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
        <Fade in={true} timeout={600}>
          <Paper elevation={3} sx={{
            p: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
            borderRadius: 3,
            border: `2px solid ${theme.palette.success.main}`
          }}>
            <Box sx={{ mb: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
            </Box>
            
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'success.main' }}>
              Email Verified! 🎉
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Welcome to Clean Street Volunteers, {nameFromState}! Your email has been verified successfully.
            </Typography>

            <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.light', borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                ✓ Registration Complete
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You're all set to start volunteering. Redirecting to your dashboard...
              </Typography>
            </Box>

            <CircularProgress sx={{ mt: 2 }} />
          </Paper>
        </Fade>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={4}>
        {/* Left Side - Info */}
        <Grid item xs={12} md={5}>
          <Fade in={true} timeout={800}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <VolunteerActivismIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    Verify Your Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Almost there! Complete your registration
                  </Typography>
                </Box>
              </Box>

              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📧 Email Verification
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95 }}>
                  We sent a 6-digit OTP to {email}. Enter it below to verify your email and activate your volunteer account.
                </Typography>
              </Paper>

              {/* Benefits */}
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    ✓ After Verification:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      <li>Access volunteer dashboard</li>
                      <li>View available events</li>
                      <li>Track volunteer hours</li>
                      <li>Earn badges and rewards</li>
                    </ul>
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        </Grid>

        {/* Right Side - Form */}
        <Grid item xs={12} md={7}>
          <Fade in={true} timeout={1000}>
            <Paper elevation={3} sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              background: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.8)
                : '#ffffff'
            }}>
              <form onSubmit={handleSubmit}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                  Enter Your OTP
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} icon={<ErrorIcon />}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} icon={<CheckCircleIcon />}>
                    {success}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'action.active', mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Enter 6-Digit OTP"
                  type="text"
                  inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    setOtp(val)
                  }}
                  placeholder="000000"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'action.active', mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !email || !otp}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <VerifiedUserIcon sx={{ mr: 1 }} />
                      Verify Email
                    </>
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  {timer > 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Resend OTP in {timer}s
                    </Typography>
                  ) : (
                    <Button
                      variant="text"
                      disabled={resending}
                      onClick={handleResendOTP}
                      sx={{ textDecoration: 'none' }}
                    >
                      {resending ? 'Sending...' : "Didn't receive OTP? Resend"}
                    </Button>
                  )}
                </Box>
              </form>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  )
}

export default VerifyEmailVolunteer
