import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { forgotPassword, resetPassword } = useAuth()
  const navigate = useNavigate()

  // Format timer display
  const [timer, setTimer] = useState(0)
  
  React.useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const result = await forgotPassword(email)
    
    if (result.success) {
      setMessage('OTP sent to your email. Please check your inbox. OTP expires in 15 minutes.')
      setStep(2)
      setTimer(900) // 15 minutes in seconds
    } else {
      setError(result.error || 'Failed to send OTP')
    }
    
    setLoading(false)
  }

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (otp.length !== 6) {
      setError('OTP must be 6 digits')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const result = await resetPassword(email, otp, newPassword)
    
    if (result.success) {
      setMessage('Password reset successfully! Redirecting to login...')
      setError('')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } else {
      setError(result.error || 'Failed to reset password')
      
      // If OTP is invalid or expired
      if (result.error?.toLowerCase().includes('otp') || 
          result.error?.toLowerCase().includes('expired') ||
          result.error?.toLowerCase().includes('invalid')) {
        // Suggest resending OTP
        setMessage('OTP may be invalid or expired. Please request a new one.')
      }
    }
    
    setLoading(false)
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0) {
      setError(`Please wait ${formatTime(timer)} before requesting a new OTP`)
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    const result = await forgotPassword(email)
    
    if (result.success) {
      setMessage('New OTP sent to your email.')
      setTimer(900) // Reset timer to 15 minutes
    } else {
      setError(result.error || 'Failed to resend OTP')
    }
    
    setLoading(false)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Reset Password
          </Typography>

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Enter your email to receive a password reset OTP
              </Typography>
              
              <form onSubmit={handleRequestOtp}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  margin="normal"
                  autoComplete="email"
                  disabled={loading}
                  placeholder="Enter your registered email"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !email}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                    Back to Login
                  </Link>
                </Box>
              </form>
            </>
          )}

          {/* Step 2: Enter OTP & New Password */}
          {step === 2 && (
            <>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Enter the 6-digit OTP sent to <strong>{email}</strong> and your new password
              </Typography>
              
              <form onSubmit={handleResetPassword}>
                <TextField
                  fullWidth
                  label="OTP Code"
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  margin="normal"
                  placeholder="Enter 6-digit OTP"
                  disabled={loading}
                  autoComplete="one-time-code"
                  inputProps={{
                    maxLength: 6,
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  helperText={
                    timer > 0 
                      ? `OTP expires in ${formatTime(timer)}` 
                      : 'OTP has expired. Please request a new one.'
                  }
                />

                <TextField
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  margin="normal"
                  autoComplete="new-password"
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  helperText="Must be at least 6 characters"
                />

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  margin="normal"
                  autoComplete="new-password"
                  disabled={loading}
                  error={confirmPassword !== '' && newPassword !== confirmPassword}
                  helperText={
                    confirmPassword !== '' && newPassword !== confirmPassword 
                      ? 'Passwords do not match' 
                      : ''
                  }
                />

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setStep(1)
                        setOtp('')
                        setNewPassword('')
                        setConfirmPassword('')
                        setMessage('')
                        setError('')
                        setTimer(0)
                      }}
                      disabled={loading}
                    >
                      Change Email
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={
                        loading || 
                        otp.length !== 6 || 
                        newPassword.length < 6 || 
                        newPassword !== confirmPassword ||
                        timer <= 0
                      }
                    >
                      {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    onClick={handleResendOtp}
                    disabled={loading || timer > 0}
                    sx={{ 
                      textDecoration: 'none', 
                      color: timer > 0 ? '#999' : '#1976d2',
                      opacity: timer > 0 ? 0.7 : 1
                    }}
                  >
                    {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : 'Resend OTP'}
                  </Button>
                </Box>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Link to="/login" style={{ textDecoration: 'none', color: '#666' }}>
                    Back to Login
                  </Link>
                </Box>
              </form>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  )
}

export default ForgotPassword