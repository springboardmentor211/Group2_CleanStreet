import React, { useState } from 'react'
import { 
  Container, Paper, Typography, TextField, Button, Box, 
  CircularProgress, Alert, Stack, Grid, InputAdornment,
  Divider, Card, CardContent, Fade
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { 
  Person, Email, Lock, Phone, LocationOn, 
  CheckCircle, VolunteerActivism, ArrowBack
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const VolunteerRegister = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    state: '',
    zipCode: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateStep1 = () => {
    const errors = []
    if (!formData.name.trim()) errors.push('Name is required')
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push('Valid email is required')
    if (formData.password.length < 6) errors.push('Password must be at least 6 characters')
    if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match')
    return errors
  }

  const handleNext = () => {
    const errors = validateStep1()
    if (errors.length > 0) {
      setError(errors[0])
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.post('/volunteers/register-basic', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        location: {
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        }
      })

      if (response.data.success) {
        // Store password temporarily for auto-login after email verification
        localStorage.setItem(`volunteer_password_${formData.email}`, formData.password)
        
        toast.success('🎉 Registration successful! Check your email for verification.')
        navigate('/verify-email', { 
          state: { 
            email: formData.email,
            name: formData.name
          } 
        })
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed'
      console.error('Registration error:', err)
      setError(errorMsg)
      toast.error(`❌ ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const BenefitsCard = ({ icon, title, description }) => (
    <Card variant="outlined" sx={{ 
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }}>
      <CardContent sx={{ textAlign: 'center', p: 2 }}>
        <Box sx={{ color: 'primary.main', mb: 1 }}>{icon}</Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  )

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={4}>
        {/* Left Side - Benefits */}
        <Grid item xs={12} md={5}>
          <Fade in={true} timeout={800}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <VolunteerActivism sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    Join Clean Street Volunteers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Make a difference in your community
                  </Typography>
                </Box>
              </Box>

              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)'
              }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🎯 Volunteer Benefits
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.95 }}>
                  Join our community • Make an impact • Grow your skills
                </Typography>
              </Paper>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <BenefitsCard
                    icon={<CheckCircle fontSize="large" />}
                    title="Easy Registration"
                    description="Quick sign-up with admin verification for safety"
                  />
                </Grid>
                <Grid item xs={6}>
                  <BenefitsCard
                    icon={<LocationOn fontSize="large" />}
                    title="Local Events"
                    description="Join cleanup events in your neighborhood"
                  />
                </Grid>
                <Grid item xs={6}>
                  <BenefitsCard
                    icon={<VolunteerActivism fontSize="large" />}
                    title="Earn Badges"
                    description="Unlock achievements as you contribute"
                  />
                </Grid>
                <Grid item xs={6}>
                  <BenefitsCard
                    icon={<Person fontSize="large" />}
                    title="Build Profile"
                    description="Track your hours and impact over time"
                  />
                </Grid>
              </Grid>

              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/login')}
                fullWidth
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  py: 1.2
                }}
              >
                Back to Login
              </Button>
            </Box>
          </Fade>
        </Grid>

        {/* Right Side - Registration Form */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #4CAF50 0%, #2196F3 100%)'
            }
          }}>
            {/* Progress Steps */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              {[1, 2].map((num) => (
                <React.Fragment key={num}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: step >= num ? 'primary.main' : 'grey.300',
                      color: step >= num ? 'white' : 'grey.500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {step > num ? <CheckCircle fontSize="small" /> : num}
                  </Box>
                  {num < 2 && (
                    <Box sx={{ 
                      flex: 1, 
                      height: '2px', 
                      bgcolor: step > num ? 'primary.main' : 'grey.300',
                      mx: 1,
                      transition: 'all 0.3s ease'
                    }} />
                  )}
                </React.Fragment>
              ))}
              <Typography variant="body2" sx={{ 
                ml: 2, 
                fontWeight: 'medium',
                color: 'text.secondary'
              }}>
                Step {step} of 2
              </Typography>
            </Box>

            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {step === 1 ? 'Create Your Account' : 'Complete Your Profile'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {step === 1 
                ? 'Enter your basic information to get started' 
                : 'Tell us a bit more about yourself (optional)'}
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  alignItems: 'center'
                }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <Fade in={true}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                      placeholder="John Doe"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main'
                          }
                        }
                      }}
                    />
                    <TextField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                      placeholder="john@example.com"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main'
                          }
                        }
                      }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main'
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Confirm Password"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main'
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleNext}
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        fontSize: '1rem',
                        mt: 1,
                        background: 'linear-gradient(45deg, #4CAF50 30%, #2196F3 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #43A047 30%, #1976D2 90%)',
                        }
                      }}
                    >
                      Continue to Profile Details →
                    </Button>
                  </Stack>
                </Fade>
              )}

              {/* Step 2: Additional Info */}
              {step === 2 && (
                <Fade in={true}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Phone Number (Optional)"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        ),
                      }}
                      placeholder="+1 (555) 123-4567"
                      helperText="Used for event notifications"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main'
                          }
                        }
                      }}
                    />
                    
                    <Divider sx={{ my: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Location (Optional)
                      </Typography>
                    </Divider>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="City"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          fullWidth
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main'
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="State"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          fullWidth
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main'
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Zip Code"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          fullWidth
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main'
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setStep(1)}
                        fullWidth
                        sx={{ 
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          borderWidth: '2px',
                          '&:hover': {
                            borderWidth: '2px'
                          }
                        }}
                      >
                        ← Back
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        fullWidth
                        sx={{ 
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 'bold',
                          textTransform: 'none',
                          fontSize: '1rem',
                          background: 'linear-gradient(45deg, #4CAF50 30%, #2196F3 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #43A047 30%, #1976D2 90%)',
                          },
                          '&.Mui-disabled': {
                            background: 'grey.300'
                          }
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Complete Registration'
                        )}
                      </Button>
                    </Box>
                  </Stack>
                </Fade>
              )}
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ 
              display: 'block', 
              textAlign: 'center', 
              mt: 3,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              fontSize: '0.75rem'
            }}>
              By registering, you agree to our <Button 
                size="small" 
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  p: 0,
                  ml: 0.5
                }}
              >
                Terms of Service
              </Button> and <Button 
                size="small" 
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  p: 0,
                  ml: 0.5
                }}
              >
                Privacy Policy
              </Button>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default VolunteerRegister