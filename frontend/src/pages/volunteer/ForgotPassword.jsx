import React, { useState } from 'react'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel
} from '@mui/material'
import { Email, Lock, ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/volunteers/forgot-password', {
        email: formData.email
      })

      if (response.data.success) {
        toast.success('OTP sent to your email!')
        setStep(2)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send OTP'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/volunteers/verify-reset-otp', {
        email: formData.email,
        otp: formData.otp
      })

      if (response.data.success) {
        toast.success('OTP verified successfully!')
        setStep(3)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid OTP'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/volunteers/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      })

      if (response.data.success) {
        toast.success('Password reset successful! Please login.')
        navigate('/login')
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to reset password'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const steps = ['Enter Email', 'Verify OTP', 'New Password']

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => step === 1 ? navigate('/login') : setStep(step - 1)}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          
          <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            {step === 1 && "We'll send you an OTP to reset your password"}
            {step === 2 && 'Enter the OTP sent to your email'}
            {step === 3 && 'Create your new password'}
          </Typography>

          <Stepper activeStep={step - 1} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <Box component="form" onSubmit={handleRequestOTP}>
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              autoFocus
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
          </Box>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <Box component="form" onSubmit={handleVerifyOTP}>
            <Alert severity="info" sx={{ mb: 3 }}>
              OTP sent to <strong>{formData.email}</strong>
            </Alert>
            <TextField
              label="Enter OTP"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
              fullWidth
              autoFocus
              disabled={loading}
              placeholder="123456"
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={handleRequestOTP}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Resend OTP
            </Button>
          </Box>
        )}

        {/* Step 3: Set New Password */}
        {step === 3 && (
          <Box component="form" onSubmit={handleResetPassword}>
            <TextField
              label="New Password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              required
              fullWidth
              autoFocus
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default ForgotPassword
