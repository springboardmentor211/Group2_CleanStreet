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
  InputAdornment
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import axios from 'axios'
import toast from 'react-hot-toast'

const VerifyEmail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  
  const emailFromState = location.state?.email || ''
  const [email, setEmail] = useState(emailFromState)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timer, setTimer] = useState(0)

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
      const response = await axios.post(
        'http://localhost:5000/api/auth/verify-email',
        { email, otp },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (response.data.success) {
        setSuccess('✅ Email verified successfully!')
        toast.success('Email verified! You can now login.')
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Verification failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setResending(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/resend-otp',
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
        setTimer(60) // 60 seconds countdown
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to resend OTP'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setResending(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
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
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <EmailIcon sx={{ fontSize: '2.5rem', color: 'primary.main' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Verify Your Email
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We've sent a 6-digit OTP to your email address
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {success}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />

          <TextField
            fullWidth
            label="Enter 6-Digit OTP"
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6)
              setOtp(val)
            }}
            disabled={loading}
            inputProps={{
              maxLength: 6,
              style: { 
                letterSpacing: '10px',
                fontSize: '1.5rem',
                textAlign: 'center',
                fontWeight: 700
              }
            }}
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            variant="outlined"
            placeholder="000000"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !email || !otp}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>

          {/* Resend OTP */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Didn't receive the OTP?
            </Typography>
            <Button
              onClick={handleResend}
              disabled={timer > 0 || resending}
              variant="outlined"
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {resending ? (
                <>
                  <CircularProgress size={18} sx={{ mr: 1 }} />
                  Sending...
                </>
              ) : timer > 0 ? (
                `Resend OTP in ${timer}s`
              ) : (
                'Resend OTP'
              )}
            </Button>
          </Box>

          {/* Info Box */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}
          >
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Tips:</strong> Check your spam folder if you don't see the email. The OTP is valid for 10 minutes.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default VerifyEmail
