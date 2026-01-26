import React, { useState } from 'react'
import {
  Container, Paper, TextField, Button, Typography, Box,
  Alert, CircularProgress, Divider, Fade, Zoom,
  InputAdornment, alpha, useTheme, FormControlLabel, Checkbox,
  TextareaAutosize, Grid, Chip, Avatar
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

const volunteerSchema = yup.object({
  name: yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  phone: yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required for volunteers'),
  location: yup.string()
    .required('Location is required')
    .min(3, 'Please enter your city/area'),
  zone: yup.string().optional(),
  reason: yup.string()
    .required('Please tell us why you want to volunteer')
    .min(50, 'Please write at least 50 characters about your motivation')
    .max(500, 'Maximum 500 characters')
})

const VolunteerRegister = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const navigate = useNavigate()
  const theme = useTheme()

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid },
    watch
  } = useForm({
    resolver: yupResolver(volunteerSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data) => {
    if (!acceptedTerms) {
      setError('Please accept the Terms & Conditions')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await axios.post('/api/volunteer/register', data)
      
      if (response.data.success) {
        setSuccess(response.data.message)
        // Redirect to email verification
        setTimeout(() => navigate('/verify-email', {
          state: {
            email: data.email,
            fromVolunteer: true
          }
        }), 3000)
      } else {
        // Handle validation errors
        if (response.data.errors && Array.isArray(response.data.errors)) {
          const errorMessages = response.data.errors.map(err => err.msg || err.message).join(', ')
          setError(errorMessages)
        } else {
          setError(response.data.error || 'Registration failed')
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    {
      icon: <StarIcon />,
      title: 'Make a Real Impact',
      description: 'Directly contribute to cleaner, safer streets in your community',
      color: '#FF9800'
    },
    {
      icon: <SecurityIcon />,
      title: 'Verified Status',
      description: 'Gain trusted volunteer status with admin approval',
      color: '#4CAF50'
    },
    {
      icon: <CheckCircleIcon />,
      title: 'Track Progress',
      description: 'Monitor and update issues you\'re assigned to',
      color: '#2196F3'
    }
  ]

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column - Form */}
        <Grid item xs={12} md={7}>
          <Zoom in>
            <Paper elevation={3} sx={{ 
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
            }}>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  Become a Clean Street Volunteer
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Join our community of dedicated volunteers making cities cleaner
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2.5}>
                  {/* Name & Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      {...register('name')}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      {...register('email')}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  {/* Phone & Location */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      {...register('phone')}
                      error={!!errors.phone}
                      helperText={errors.phone?.message || '10 digits without spaces'}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City/Area"
                      {...register('location')}
                      error={!!errors.location}
                      helperText={errors.location?.message || 'Your city or local area'}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  {/* Zone (Optional) */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Zone/Neighborhood (Optional)"
                      {...register('zone')}
                      helperText="Specific zone or neighborhood you want to serve"
                      disabled={loading}
                    />
                  </Grid>

                  {/* Password Fields */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      {...register('password')}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      {...register('confirmPassword')}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  {/* Reason Textarea */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Why do you want to volunteer? *
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Tell us about your motivation to volunteer, any relevant experience, and how you can contribute..."
                      {...register('reason')}
                      error={!!errors.reason}
                      helperText={errors.reason?.message || 'Minimum 50 characters'}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <InfoIcon sx={{ color: 'text.secondary', mt: 2 }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  {/* Terms Checkbox */}
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          I agree to the{' '}
                          <Link to="/terms" style={{ color: theme.palette.primary.main }}>
                            Terms & Conditions
                          </Link>
                          {' '}and understand that my application requires admin approval
                        </Typography>
                      }
                    />
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading || !isValid || !acceptedTerms}
                      sx={{ 
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: '1rem'
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        'Submit Volunteer Application'
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </form>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  sx={{ mr: 2 }}
                >
                  Regular Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="text"
                >
                  Register as Citizen
                </Button>
              </Box>
            </Paper>
          </Zoom>
        </Grid>

        {/* Right Column - Benefits */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
              Volunteer Benefits
            </Typography>
            
            {benefits.map((benefit, index) => (
              <Fade in timeout={800} key={index} style={{ transitionDelay: `${index * 200}ms` }}>
                <Paper sx={{ 
                  p: 2.5, 
                  mb: 2.5,
                  borderRadius: 2,
                  borderLeft: `4px solid ${benefit.color}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2
                }}>
                  <Avatar sx={{ 
                    bgcolor: alpha(benefit.color, 0.1), 
                    color: benefit.color,
                    width: 48,
                    height: 48
                  }}>
                    {benefit.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Box>
                </Paper>
              </Fade>
            ))}

            <Paper sx={{ 
              p: 3, 
              mt: 4,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                Application Process
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { step: 1, text: 'Submit application with email verification' },
                  { step: 2, text: 'Admin reviews your application (1-3 days)' },
                  { step: 3, text: 'Receive approval email with credentials' },
                  { step: 4, text: 'Login and start volunteering!' }
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      width: 30,
                      height: 30,
                      fontSize: '0.875rem'
                    }}>
                      {item.step}
                    </Avatar>
                    <Typography variant="body2">
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default VolunteerRegister